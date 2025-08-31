// Pretixから提供された認証情報
const CLIENT_ID = "i0VwMUzGedRaeEq1OVFZ7ez9XGnKeptlTOEK5Nlr";
const REDIRECT_URI = "https://auth.streamtech.cloud/callback";

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

// HLS.jsで動画をセットする関数
function setVideoSource(videoId, url) {
    const video = document.getElementById(videoId);
    if (!video) return;

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log(`動画ソースがセットされました: ${videoId}`);
            video.controls = true; // プレイヤーのコントロールを有効化
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function() {
            console.log(`動画ソースがセットされました: ${videoId}`);
            video.controls = true; // プレイヤーのコントロールを有効化
        });
    } else {
        console.error('HLSがこのブラウザでサポートされていません。');
    }
}

// 初期化処理
window.onload = () => {
    const getRightsBtn = document.getElementById('get-rights-btn');
    const purchaseTicketBtn = document.querySelector('a[href*="pretix.eu/pyconjp/"]');
    const videoElements = document.querySelectorAll('video');

    // 初期状態では動画プレイヤーのコントロールを無効化
    videoElements.forEach(video => {
        video.controls = false;
        // ポスター画像を表示
        video.poster = 'poster.png';
    });
    
    // 「視聴権利の取得」ボタンのクリックイベントを設定
    getRightsBtn.addEventListener('click', async () => {
        // トークンがない場合は認証フローを開始
        if (!token) {
            const pretixAuthorizeUrl = new URL('https://pretix.eu/pyconjp/oauth2/v1/authorize');
            pretixAuthorizeUrl.searchParams.set('client_id', CLIENT_ID);
            pretixAuthorizeUrl.searchParams.set('response_type', 'code');
            pretixAuthorizeUrl.searchParams.set('scope', 'openid profile email');
            pretixAuthorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
            window.location.href = pretixAuthorizeUrl.toString();
            return;
        }

        // トークンがあり、かつチケットを所持している場合にのみAPIを呼び出す
        const payload = decodeJwt(token);
        if (payload && payload.has_ticket) {
            getRightsBtn.disabled = true;
            getRightsBtn.textContent = '視聴準備中...';

            try {
                const response = await fetch('https://auth.streamtech.cloud/get-stream-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: token })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Failed to fetch stream URLs.');
                }
                
                const data = await response.json();
                
                // 動画URLを各プレイヤーにセット
                if (data.track1_url) {
                    setVideoSource('video1', data.track1_url);
                }
                if (data.track2_url) {
                    setVideoSource('video2', data.track2_url);
                }
                if (data.track3_url) {
                    setVideoSource('video3', data.track3_url);
                }
                if (data.track4_url) {
                    setVideoSource('video4', data.track4_url);
                }
                
                getRightsBtn.textContent = '視聴準備完了！';

            } catch (error) {
                console.error("ストリームURLの取得中にエラーが発生しました:", error);
                alert("ストリームURLの取得中にエラーが発生しました。コンソールを確認してください。");
                getRightsBtn.disabled = false;
                getRightsBtn.textContent = 'ストリーム視聴';
            }
        } else {
            alert("ライブ配信チケットはまだ購入されていません。チケットを購入してから再度お試しください。");
        }
    });

    // ページロード時の初期UI状態設定
    if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.has_ticket) {
            console.log("チケット購入が確認されました。'視聴チケット購入'ボタンを無効化します。");
            purchaseTicketBtn.style.pointerEvents = 'none';
            purchaseTicketBtn.style.opacity = '0.5';
            purchaseTicketBtn.href = '#';
            
            getRightsBtn.textContent = 'ストリーム視聴';
        } else {
            console.log("ライブ配信チケットはまだ購入されていません。");
            getRightsBtn.textContent = '視聴権利の取得';
        }
    } else {
        // トークンがない場合は初期状態
        getRightsBtn.textContent = '視聴権利の取得';
    }
};
