import config from "../config/config.js";
import {HttpUtils} from "./http-utils.js";

export class AuthUtils {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoTokenKey = 'userInfo';

    static setAuthInfo(accessTokenKey, refreshTokenKey, userInfo = null) {
        localStorage.setItem(this.accessTokenKey, accessTokenKey);
        localStorage.setItem(this.refreshTokenKey, refreshTokenKey);
        if(userInfo) {
            localStorage.setItem(this.userInfoTokenKey, JSON.stringify(userInfo));
        }
    }

    static removeAuthInfo(accessTokenKey, refreshTokenKey, userInfo) {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userInfoTokenKey);
    }

    static getAuthInfo(key = null) {
        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userInfoTokenKey].includes(key)) {
            return localStorage.getItem(key);
        } else {
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userInfoTokenKey]: localStorage.getItem(this.userInfoTokenKey),
            }
        }
    }

    static async updateRefreshToken() {
        let result = false;
        const refreshToken = this.getAuthInfo(this.refreshTokenKey);

        if (refreshToken) {
            const response = await fetch(config.api + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if(response && response.status === 200) {
                const tokens = await response.json();

                if(tokens && !tokens.error) {
                    this.setAuthInfo(tokens.accessToken, tokens.refreshToken);
                    result = true;
                }
            }
        }

        if(!result) {
           this.removeAuthInfo();
        }
        return result;
    }
}