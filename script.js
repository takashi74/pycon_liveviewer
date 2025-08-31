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

    // 動画ソースがセットされたらポスターを非表示にする
    video.removeAttribute('poster');

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log(`動画ソースがセットされました: ${videoId}`);
            video.controls = true; // プレイヤーのコントロールを有効化
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error(`HLS.jsエラー for ${videoId}:`, data.type, data.details);
            // エラーが発生したらコントロールを無効化し、ポスターを再表示
            video.controls = false;
            video.poster = 'poster.png';
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
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    function decodeJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error("JWTデコード失敗", e);
            return null;
        }
    }

    function setVideoSource(videoEl, url) {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(videoEl);
            hls.on(Hls.Events.MANIFEST_PARSED, () => videoEl.controls = true);
        } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            videoEl.src = url;
            videoEl.addEventListener('loadedmetadata', () => videoEl.controls = true);
        }
    }

    const payload = token ? decodeJwt(token) : null;
    const registeredTracks = payload?.jstream_registered_tracks || {};

    document.querySelectorAll('.player-container').forEach(container => {
        const btn = container.querySelector('.play-btn');
        const video = container.querySelector('video');
        const streamId = container.dataset.streamId;

        if (!registeredTracks[streamId]) {
            // 登録されていないトラックはボタン無効化
            btn.disabled = true;
            btn.style.opacity = 0.5;
            return;
        }

        // 登録済みトラックはクリックで /session を呼ぶ
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = "準備中...";

            try {
                const res = await fetch(`/session?token=${encodeURIComponent(token)}&stream_id=${encodeURIComponent(streamId)}`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || "Session取得失敗");
                }

                const data = await res.json();
                setVideoSource(video, data.playback_url);
                btn.textContent = "再生中";

            } catch (e) {
                console.error("Session取得エラー:", e);
                alert("ストリーム再生に失敗しました。");
                btn.disabled = false;
                btn.textContent = "再生";
            }
        });
    });
};
