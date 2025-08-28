// Pretixから提供された認証情報
const CLIENT_ID = "IXn9dPLFKNAsw8cmggJ2fwJzcypkbHAXVIlg32ZC";
const REDIRECT_URI = "https://auth.streamtech.cloud/callback";

// 「視聴権利の取得」ボタンのイベントリスナー
document.getElementById('get-rights-btn').addEventListener('click', () => {
    const pretixAuthorizeUrl = new URL('https://pretix.streamtech.cloud/pyconjp/oauth2/v1/authorize');
    pretixAuthorizeUrl.searchParams.set('client_id', CLIENT_ID);
    pretixAuthorizeUrl.searchParams.set('response_type', 'code');
    pretixAuthorizeUrl.searchParams.set('scope', 'openid profile email');
    pretixAuthorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);

    window.location.href = pretixAuthorizeUrl.toString();
});

// URLから認証コードを取得
const urlParams = new URLSearchParams(window.location.search);
const authCode = urlParams.get('code');

// チケット購入確認後の動画URL
const videoUrl = "https://wowza.jst-lab.com/okawa_live_test/video1/playlist.m3u8";

if (authCode) {
    console.log("認証コードを取得しました:", authCode);
    
    // チケット購入ボタンと視聴権利ボタンを無効化する関数
    function disableButtons() {
        const primaryBtn = document.querySelector('.btn-primary');
        const secondaryBtn = document.querySelector('.btn-secondary');

        // ボタンを無効化
        primaryBtn.style.pointerEvents = 'none';
        primaryBtn.style.opacity = '0.5';
        primaryBtn.href = '#';

        secondaryBtn.style.pointerEvents = 'none';
        secondaryBtn.style.opacity = '0.5';
    }

    // HLS動画を初期化して再生する関数
    function playVideo(videoId, streamUrl) {
        const videoElement = document.getElementById(videoId);
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(videoElement);
            videoElement.play();
            // 動画の再生が始まったらボタンを無効化
            videoElement.addEventListener('playing', disableButtons, { once: true });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = streamUrl;
            videoElement.play();
            // 動画の再生が始まったらボタンを無効化
            videoElement.addEventListener('playing', disableButtons, { once: true });
        }
    }

    // 全てのプレイヤーを再生
    playVideo('video1', videoUrl);
    playVideo('video2', videoUrl);
    playVideo('video3', videoUrl);
    playVideo('video4', videoUrl);
}