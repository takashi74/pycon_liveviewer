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
        console.error("JWTのデコードに失敗しました:", e);
        return null;
    }
}

// 動画をロードして再生する関数
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

// チケット購入済みの場合にボタンを無効化し、動画を再生
if (token) {
    const payload = decodeJwt(token);
    
    // チケット購入済みであればボタンを無効化
    if (payload && payload.has_ticket) {
        console.log("チケット購入が確認されました。'視聴チケット購入'ボタンを無効化します。");
        
        const primaryBtn = document.querySelector('.btn-primary');
        primaryBtn.style.pointerEvents = 'none';
        primaryBtn.style.opacity = '0.5';
        primaryBtn.href = '#';

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
            console.error('動画URLの取得に失敗しました:', error);
        });

    } else {
        console.log("チケット情報が見つからないか、購入が未完了です。");
    }
}