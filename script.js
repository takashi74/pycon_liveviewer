document.getElementById('get-rights-btn').addEventListener('click', () => {
    // 認証サーバーのURL
    const authServerUrl = "https://your-auth-server.com/login";

    // ユーザーを認証サーバーにリダイレクト
    window.location.href = authServerUrl;
});