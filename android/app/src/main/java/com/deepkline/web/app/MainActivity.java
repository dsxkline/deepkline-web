package com.deepkline.web.app;

import android.os.Bundle;
import android.util.Log;
import android.view.View;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SafeAreaDebug";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        View rootView = getWindow().getDecorView();

        ViewCompat.setOnApplyWindowInsetsListener(rootView, (v, insets) -> {
            int top = insets.getInsets(WindowInsetsCompat.Type.systemBars()).top;
            int bottom = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom;
            int left = insets.getInsets(WindowInsetsCompat.Type.systemBars()).left;
            int right = insets.getInsets(WindowInsetsCompat.Type.systemBars()).right;

            // 打印到 Android Logcat
            Log.d(TAG, "SafeAreaInsets => top: " + top +
                    ", bottom: " + bottom +
                    ", left: " + left +
                    ", right: " + right);

            // 发送给前端 WebView
            JSObject ret = new JSObject();
            ret.put("top", top);
            ret.put("bottom", bottom);
            ret.put("left", left);
            ret.put("right", right);
            bridge.triggerWindowJSEvent("safeAreaChange", ret.toString());

            return insets;
        });
    }
}
