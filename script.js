// 各動画プレイヤーを初期化する関数
function initializeHlsPlayer(videoId) {
    const video = document.getElementById(videoId);
    if (Hls.isSupported()) {
        const hls = new Hls();
        // ここにHLSストリームのURLをセットします
        // 現状は何も再生しないので、コメントアウトまたは空にしています。
        // hls.loadSource('YOUR_STREAM_URL_HERE');
        hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = 'YOUR_STREAM_URL_HERE';
    }
}

// 4つのプレイヤーをすべて初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeHlsPlayer('video1');
    initializeHlsPlayer('video2');
    initializeHlsPlayer('video3');
    initializeHlsPlayer('video4');
});

// 視聴権利の取得ボタンのイベントリスナー
const getRightsBtn = document.getElementById('get-rights-btn');
getRightsBtn.addEventListener('click', () => {
    // ここに認証サーバーへのリダイレクトロジックを追加します
    alert("このボタンはまだ機能しません。\n認証フローを実装すると、ここにロジックが追加されます。");
});