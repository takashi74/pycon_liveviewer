// 「視聴権利の取得」ボタンのイベントリスナー
document.getElementById('get-rights-btn').addEventListener('click', () => {
    // ユーザーをあなたの認証サーバーにリダイレクトします。
    const authServerUrl = "https://auth.streamtech.cloud/authorize";
    window.location.href = authServerUrl;
});

// URLパラメータを取得
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