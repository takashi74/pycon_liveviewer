// Pretixから提供された認証情報
const CLIENT_ID = "i0VwMUzGedRaeEq1OVFZ7ez9XGnKeptlTOEK5Nlr";
const REDIRECT_URI = "https://auth.streamtech.cloud/callback";

// 「視聴権利の獲得」ボタンのイベントリスナー
document.getElementById('get-rights-btn').addEventListener('click', () => {
    // ユーザーをPretixの認可エンドポイントにリダイレクト
    const pretixAuthorizeUrl = new URL('https://pretix.eu/pyconjp/oauth2/v1/authorize');
    pretixAuthorizeUrl.searchParams.set('client_id', CLIENT_ID);
    pretixAuthorizeUrl.searchParams.set('response_type', 'code');
    pretixAuthorizeUrl.searchParams.set('scope', 'openid profile email');
    pretixAuthorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);

    window.location.href = pretixAuthorizeUrl.toString();
});

// URLからトークンを取得
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// JWTのペイロードをデコードするヘルパー関数
function decodeJwt(token) {
    try {
        const payloadBase64 = token.split('.')[1];
        const payload = atob(payloadBase64);
        return JSON.parse(payload);
    } catch (e) {
        console.error("JWTのデコードに失敗しました。", e);
        return null;
    }
}

// HLS.jsで動画を再生する関数
function playVideo(videoId, url) {
    const video = document.getElementById(videoId);
    if (!video) return;

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log(`動画の再生を開始します: ${videoId}`);
            video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function() {
            console.log(`動画の再生を開始します: ${videoId}`);
            video.play();
        });
    } else {
        console.error('HLSがこのブラウザでサポートされていません。');
    }
}

// 初期化処理
window.onload = () => {
    if (token) {
        const payload = decodeJwt(token);
        if (!payload) {
            console.error("無効なトークンです。");
            return;
        }

        // 視聴権利の取得ボタンを無効化するのは、チケットを所有している時のみ
        const getRightsBtn = document.getElementById('get-rights-btn');
        if (payload.has_ticket) {
            console.log("チケット購入が確認されました。'視聴権利の取得'ボタンを無効化します。");
            getRightsBtn.style.pointerEvents = 'none';
            getRightsBtn.style.opacity = '0.5';

            // バックエンドから動画URLを取得するAPIを呼び出す
            fetch('https://auth.streamtech.cloud/get-stream-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.detail || 'Failed to fetch stream URLs.'); });
                }
                return response.json();
            })
            .then(data => {
                // 返されたURLを使って各ビデオを再生
                if (data.track1_url) {
                    playVideo('video1', data.track1_url);
                }
                if (data.track2_url) {
                    playVideo('video2', data.track2_url);
                }
                if (data.track3_url) {
                    playVideo('video3', data.track3_url);
                }
                if (data.track4_url) {
                    playVideo('video4', data.track4_url);
                }
            })
            .catch(error => {
                console.error("ストリームURLの取得中にエラーが発生しました:", error);
            });

        } else {
            console.log("ライブ配信チケットはまだ購入されていません。");
            // トークンは有効だがチケットがない場合
            alert("ライブ配信チケットはまだ購入されていません。チケットを購入してから再度お試しください。");
        }
    }
};
