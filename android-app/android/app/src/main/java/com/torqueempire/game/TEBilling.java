package com.torqueempire.game;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

/**
 * Torque Empire – Google Play Billing inside the native app (Capacitor).
 * The game (secure.js) calls it as Capacitor.Plugins.TEBilling:
 *   details({skus:[...]})       → {items:[{itemId, type, currency, value, price}]}
 *   buy({sku, type:'inapp'|'subs'}) → {token, state} | {cancelled:true} | {pending:true} | {err}
 *   purchases()                 → {items:[{itemId, purchaseToken, state, type}]}
 *   consume({token})            → {ok}
 * The SERVER (Torque Guard) checks every purchase with Google and acknowledges it.
 */
@CapacitorPlugin(name = "TEBilling")
public class TEBilling extends Plugin {
    private BillingClient client;
    private PluginCall buyCall;

    private final PurchasesUpdatedListener listener = (BillingResult r, List<Purchase> list) -> {
        PluginCall call = buyCall;
        buyCall = null;
        if (call == null) return;
        int code = r.getResponseCode();
        if (code == BillingClient.BillingResponseCode.OK && list != null && !list.isEmpty()) {
            Purchase p = list.get(0);
            JSObject o = new JSObject();
            o.put("token", p.getPurchaseToken());
            o.put("state", p.getPurchaseState());
            o.put("pending", p.getPurchaseState() == Purchase.PurchaseState.PENDING);
            call.resolve(o);
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            JSObject o = new JSObject();
            o.put("cancelled", true);
            call.resolve(o);
        } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            JSObject o = new JSObject();
            o.put("owned", true);
            call.resolve(o);
        } else {
            JSObject o = new JSObject();
            o.put("err", code);
            o.put("msg", r.getDebugMessage());
            call.resolve(o);
        }
    };

    @Override
    public void load() {
        client = BillingClient.newBuilder(getContext())
            .setListener(listener)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection()
            .build();
    }

    private interface Ready { void run(); }

    private void ready(PluginCall call, Ready r) {
        if (client.isReady()) { r.run(); return; }
        client.startConnection(new BillingClientStateListener() {
            @Override public void onBillingSetupFinished(BillingResult res) {
                if (res.getResponseCode() == BillingClient.BillingResponseCode.OK) r.run();
                else call.reject("billing_unavailable", String.valueOf(res.getResponseCode()));
            }
            @Override public void onBillingServiceDisconnected() { }
        });
    }

    private static String typeOf(String t) {
        return "subs".equals(t) ? BillingClient.ProductType.SUBS : BillingClient.ProductType.INAPP;
    }

    private interface Got { void got(List<ProductDetails> list); }

    private void query(List<String> skus, String type, Got cb) {
        List<QueryProductDetailsParams.Product> ps = new ArrayList<>();
        for (String s : skus) ps.add(QueryProductDetailsParams.Product.newBuilder().setProductId(s).setProductType(type).build());
        if (ps.isEmpty()) { cb.got(new ArrayList<>()); return; }
        client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(ps).build(),
            (res, result) -> cb.got(result != null && result.getProductDetailsList() != null ? result.getProductDetailsList() : new ArrayList<>()));
    }

    private static void fill(JSObject o, ProductDetails d) {
        if (BillingClient.ProductType.SUBS.equals(d.getProductType())) {
            List<ProductDetails.SubscriptionOfferDetails> offs = d.getSubscriptionOfferDetails();
            if (offs != null && !offs.isEmpty()) {
                List<ProductDetails.PricingPhase> ph = offs.get(0).getPricingPhases().getPricingPhaseList();
                ProductDetails.PricingPhase last = ph.get(ph.size() - 1);           // the normal (repeating) price
                o.put("currency", last.getPriceCurrencyCode());
                o.put("value", last.getPriceAmountMicros() / 1e6);
                o.put("price", last.getFormattedPrice());
            }
        } else {
            ProductDetails.OneTimePurchaseOfferDetails one = d.getOneTimePurchaseOfferDetails();
            if (one != null) {
                o.put("currency", one.getPriceCurrencyCode());
                o.put("value", one.getPriceAmountMicros() / 1e6);
                o.put("price", one.getFormattedPrice());
            }
        }
    }

    @PluginMethod
    public void details(PluginCall call) {
        JSArray arr = call.getArray("skus");
        List<String> inapp = new ArrayList<>(), subs = new ArrayList<>();
        try {
            for (int i = 0; i < arr.length(); i++) {
                String s = arr.getString(i);
                if (s.startsWith("vip_pass")) subs.add(s); else inapp.add(s);
            }
        } catch (Exception e) { call.reject("bad"); return; }
        ready(call, () -> query(inapp, BillingClient.ProductType.INAPP, a ->
            query(subs, BillingClient.ProductType.SUBS, b -> {
                JSArray out = new JSArray();
                List<ProductDetails> all = new ArrayList<>(a);
                all.addAll(b);
                for (ProductDetails d : all) {
                    JSObject o = new JSObject();
                    o.put("itemId", d.getProductId());
                    o.put("type", d.getProductType());
                    fill(o, d);
                    out.put(o);
                }
                JSObject r = new JSObject();
                r.put("items", out);
                call.resolve(r);
            })));
    }

    @PluginMethod
    public void buy(PluginCall call) {
        String sku = call.getString("sku");
        String type = typeOf(call.getString("type", "inapp"));
        if (sku == null) { call.reject("bad"); return; }
        if (buyCall != null) { JSObject o = new JSObject(); o.put("err", "busy"); call.resolve(o); return; }
        ready(call, () -> {
            List<String> one = new ArrayList<>();
            one.add(sku);
            query(one, type, list -> {
                if (list.isEmpty()) { JSObject o = new JSObject(); o.put("err", "no_product"); call.resolve(o); return; }
                ProductDetails d = list.get(0);
                BillingFlowParams.ProductDetailsParams.Builder pb = BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d);
                if (BillingClient.ProductType.SUBS.equals(type)) {
                    List<ProductDetails.SubscriptionOfferDetails> offs = d.getSubscriptionOfferDetails();
                    if (offs == null || offs.isEmpty()) { JSObject o = new JSObject(); o.put("err", "no_offer"); call.resolve(o); return; }
                    pb.setOfferToken(offs.get(0).getOfferToken());
                }
                List<BillingFlowParams.ProductDetailsParams> pl = new ArrayList<>();
                pl.add(pb.build());
                BillingFlowParams fp = BillingFlowParams.newBuilder().setProductDetailsParamsList(pl).build();
                buyCall = call;
                getActivity().runOnUiThread(() -> {
                    BillingResult r = client.launchBillingFlow(getActivity(), fp);
                    if (r.getResponseCode() != BillingClient.BillingResponseCode.OK && buyCall == call) {
                        buyCall = null;
                        JSObject o = new JSObject();
                        if (r.getResponseCode() == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) o.put("owned", true);
                        else { o.put("err", r.getResponseCode()); o.put("msg", r.getDebugMessage()); }
                        call.resolve(o);
                    }
                });
            });
        });
    }

    @PluginMethod
    public void purchases(PluginCall call) {
        ready(call, () -> client.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(), (r1, inapp) ->
            client.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build(), (r2, subs) -> {
                JSArray out = new JSArray();
                add(out, inapp, "inapp");
                add(out, subs, "subs");
                JSObject r = new JSObject();
                r.put("items", out);
                call.resolve(r);
            })));
    }

    private static void add(JSArray out, List<Purchase> ps, String type) {
        if (ps == null) return;
        for (Purchase p : ps) {
            for (String id : p.getProducts()) {
                JSObject o = new JSObject();
                o.put("itemId", id);
                o.put("purchaseToken", p.getPurchaseToken());
                o.put("state", p.getPurchaseState());
                o.put("acknowledged", p.isAcknowledged());
                o.put("type", type);
                out.put(o);
            }
        }
    }

    @PluginMethod
    public void consume(PluginCall call) {
        String token = call.getString("token");
        if (token == null) { call.reject("bad"); return; }
        ready(call, () -> client.consumeAsync(ConsumeParams.newBuilder().setPurchaseToken(token).build(), (r, t) -> {
            JSObject o = new JSObject();
            o.put("ok", r.getResponseCode() == BillingClient.BillingResponseCode.OK);
            call.resolve(o);
        }));
    }

    // Backup: acknowledge from the phone too (the server normally does it). Unacknowledged purchases are refunded after 3 days.
    @PluginMethod
    public void acknowledge(PluginCall call) {
        String token = call.getString("token");
        if (token == null) { call.reject("bad"); return; }
        ready(call, () -> client.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(token).build(), r -> {
            JSObject o = new JSObject();
            o.put("ok", r.getResponseCode() == BillingClient.BillingResponseCode.OK);
            call.resolve(o);
        }));
    }
}
