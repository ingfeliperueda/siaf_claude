package com.abismodeespuma.juego;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

// Abre el juego (assets/index.html) a pantalla completa en un WebView.
public class MainActivity extends Activity {
  private WebView web;

  @Override
  protected void onCreate(Bundle b) {
    super.onCreate(b);
    getWindow().addFlags(0x80 | 0x400); // FLAG_KEEP_SCREEN_ON | FLAG_FULLSCREEN
    web = new WebView(this);
    web.setBackgroundColor(0xff000000);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true); // guardado de partidas (localStorage)
    s.setDatabaseEnabled(true);
    s.setAllowFileAccess(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    web.setWebViewClient(new WebViewClient());
    web.setWebChromeClient(new WebChromeClient());
    setContentView(web);
    web.loadUrl("file:///android_asset/index.html");
  }

  // Pantalla completa inmersiva: oculta las barras del sistema.
  private void immersive() {
    // LAYOUT_STABLE | LAYOUT_HIDE_NAVIGATION | LAYOUT_FULLSCREEN | HIDE_NAVIGATION | FULLSCREEN | IMMERSIVE_STICKY
    getWindow().getDecorView().setSystemUiVisibility(0x100 | 0x200 | 0x400 | 0x2 | 0x4 | 0x1000);
  }

  @Override
  public void onWindowFocusChanged(boolean f) {
    super.onWindowFocusChanged(f);
    if (f) immersive();
  }

  // El botón «atrás» del celular hace lo mismo que la tecla Esc en el juego.
  @Override
  public void onBackPressed() {
    web.evaluateJavascript("dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));dispatchEvent(new KeyboardEvent('keyup',{code:'Escape',key:'Escape'}))", null);
  }

  @Override
  protected void onPause() {
    web.onPause();
    super.onPause();
  }

  @Override
  protected void onResume() {
    super.onResume();
    web.onResume();
    immersive();
  }
}
