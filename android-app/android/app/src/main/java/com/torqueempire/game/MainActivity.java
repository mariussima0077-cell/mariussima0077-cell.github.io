package com.torqueempire.game;

import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

// Full screen like the Play (TWA) version: the phone's top bar (signal, battery, clock)
// and the bottom navigation bar are hidden. A swipe from the edge shows them for a moment.
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TEBilling.class);   // Google Play Billing (payments) – see TEBilling.java
        registerPlugin(TEIntegrity.class); // Google Play Integrity (anti-cheat) – see TEIntegrity.java
        super.onCreate(savedInstanceState);
        // v16-154: the screen stays on while the game is open (idle game; tester Wazza4ever: the phone went to sleep)
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideBars();
    }

    @Override
    public void onResume() {
        super.onResume();
        hideBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    private void hideBars() {
        WindowInsetsControllerCompat c =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
