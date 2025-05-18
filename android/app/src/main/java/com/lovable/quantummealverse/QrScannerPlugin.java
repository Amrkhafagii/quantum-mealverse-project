
package com.lovable.quantummealverse;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.activity.result.ActivityResult;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(
    name = "QrScanner",
    permissions = {
        @Permission(
            strings = { Manifest.permission.CAMERA },
            alias = "camera"
        )
    }
)
public class QrScannerPlugin extends Plugin {
    private static final String TAG = "QrScannerPlugin";
    private BarcodeScanner barcodeScanner;
    private ExecutorService cameraExecutor;
    private PluginCall savedScanCall;

    @Override
    public void load() {
        BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .build();
        barcodeScanner = BarcodeScanning.getClient(options);
        cameraExecutor = Executors.newSingleThreadExecutor();
    }

    @PluginMethod
    public void requestCameraPermission(PluginCall call) {
        if (!hasRequiredPermissions()) {
            requestPermissionForAlias("camera", call, "cameraPermissionCallback");
        } else {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        }
    }

    @PermissionCallback
    private void cameraPermissionCallback(PluginCall call) {
        if (getPermissionState("camera") == getPermissionState("granted")) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        } else {
            JSObject result = new JSObject();
            result.put("granted", false);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void scanQrCode(PluginCall call) {
        if (!hasRequiredPermissions()) {
            call.reject("Camera permission is required");
            return;
        }

        savedScanCall = call;
        
        Intent intent = new Intent(getActivity(), QrScannerActivity.class);
        startActivityForResult(call, intent, "handleScanResult");
    }

    @ActivityCallback
    private void handleScanResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }
        
        if (result.getResultCode() == android.app.Activity.RESULT_OK) {
            Intent data = result.getData();
            if (data != null && data.hasExtra("qrContent")) {
                String qrContent = data.getStringExtra("qrContent");
                JSObject ret = new JSObject();
                ret.put("value", qrContent);
                call.resolve(ret);
            } else {
                call.reject("No data received from scanner");
            }
        } else {
            call.reject("Scanning was cancelled or failed");
        }
    }

    @PluginMethod
    public void checkCameraAvailability(PluginCall call) {
        try {
            boolean hasCamera = getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY);
            JSObject result = new JSObject();
            result.put("available", hasCamera);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Error checking camera: " + e.getMessage());
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (cameraExecutor != null) {
            cameraExecutor.shutdown();
        }
        super.handleOnDestroy();
    }
}
