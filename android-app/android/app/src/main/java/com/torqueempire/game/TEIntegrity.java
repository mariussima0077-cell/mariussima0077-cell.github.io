package com.torqueempire.game;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.integrity.IntegrityManager;
import com.google.android.play.core.integrity.IntegrityManagerFactory;
import com.google.android.play.core.integrity.IntegrityTokenRequest;

/**
 * Torque Empire – Google Play Integrity (anti-cheat, v16-105).
 * The game (secure.js) calls Capacitor.Plugins.TEIntegrity.token({nonce}) → {token} | {err}.
 * The token is sent to our server (Torque Guard), which asks Google what it means:
 *   – is this the real app from Google Play (not a modded APK / Lucky Patcher copy)?
 *   – is it a real, not-rooted phone (not an emulator)?
 * The phone itself cannot read or fake the answer – only Google and our server can.
 */
@CapacitorPlugin(name = "TEIntegrity")
public class TEIntegrity extends Plugin {
    @PluginMethod
    public void token(PluginCall call) {
        String nonce = call.getString("nonce", "");
        if (nonce == null || nonce.length() < 16) { call.reject("bad nonce"); return; }
        try {
            IntegrityManager m = IntegrityManagerFactory.create(getContext().getApplicationContext());
            m.requestIntegrityToken(IntegrityTokenRequest.builder().setNonce(nonce).build())
                .addOnSuccessListener(r -> { JSObject o = new JSObject(); o.put("token", r.token()); call.resolve(o); })
                .addOnFailureListener(e -> { JSObject o = new JSObject(); o.put("err", String.valueOf(e.getMessage())); call.resolve(o); });
        } catch (Exception e) {
            JSObject o = new JSObject(); o.put("err", String.valueOf(e.getMessage())); call.resolve(o);
        }
    }
}
