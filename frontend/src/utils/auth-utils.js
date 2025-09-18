export class AuthUtils {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoTokenKey = 'userInfo';

    static setAuthInfo(accessTokenKey, refreshTokenKey, userInfo) {
        localStorage.setItem(this.accessTokenKey, accessTokenKey);
        localStorage.setItem(this.refreshTokenKey, refreshTokenKey);
        localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
    }

    static removeAuthInfo(accessTokenKey, refreshTokenKey, userInfo) {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    static getAuthInfo(key = null) {
        if(key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            }
        }
    }
}