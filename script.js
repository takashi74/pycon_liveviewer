// Pretixから提供された認証情報
const CLIENT_ID = "IXn9dPLFKNAsw8cmggJ2fwJzcypkbHAXVIlg32ZC";
const REDIRECT_URI = "https://auth.streamtech.cloud/callback";

// 「視聴権利の取得」ボタンのイベントリスナー
document.getElementById('get-rights-btn').addEventListener('click', () => {
    // ユーザーをPretixの認可エンドポイントにリダイレクト
    const pretixAuthorizeUrl = new URL('https://pretix.streamtech.cloud/pyconjp/oauth2/v1/authorize');
    pretixAuthorizeUrl.searchParams.set('client_id', CLIENT_ID);
    pretixAuthorizeUrl.searchParams.set('response_type', 'code');
    pretixAuthorizeUrl.searchParams.set('scope', 'openid profile email');
    pretixAuthorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);

    window.location.href = pretixAuthorizeUrl.toString();
});

// URLから認証コードを取得し、動画を再生
const urlParams = new URLSearchParams(window.location.search);
const authCode = urlParams.get('code');

// チケット購入確認後の動画URL
const videoUrl = "https://wowza.jst-lab.com/okawa_live_test/video1/playlist.m3u8";

if (authCode) {
    console.log("認証コードを取得しました:", authCode);
    
    // HLS動画を初期化して再生する関数
    function playVideo(videoId, streamUrl) {
        const videoElement = document.getElementById(videoId);
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(videoElement);
            videoElement.play();
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = streamUrl;
            videoElement.play();
        }
    }

    // 全てのプレイヤーを再生
    playVideo('video1', videoUrl);
    playVideo('video2', videoUrl);
    playVideo('video3', videoUrl);
    playVideo('video4', videoUrl);
}