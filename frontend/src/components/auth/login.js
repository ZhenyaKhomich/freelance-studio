import {AuthUtils} from "../../utils/auth-utils.js";
import {HttpUtils} from "../../utils/http-utils.js";

export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/');
        }

        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.rememberMeElement = document.getElementById('remember-me');
        this.commonErrorElement = document.getElementById('common-error');

        document.getElementById('process-button').addEventListener('click', this.login.bind(this));
    }

    validateForm() {
        let isValid = true;
        if (this.emailElement.value && this.emailElement.value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/)) {
            this.emailElement.classList.remove('is-invalid');
        } else {
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordElement.value) {
            this.passwordElement.classList.remove('is-invalid');
        } else {
            this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async login() {
        this.commonErrorElement.style.display = 'none';

        if (this.validateForm()) {

            const result = await HttpUtils.request('/login', 'POST', false,{
                email: this.emailElement.value,
                password: this.passwordElement.value,
                rememberMe: this.rememberMeElement.checked
            });

            if (result.error || !result.response || (result.response && (!result.response.accessToken || !result.response.refreshToken
                || !result.response.id || !result.response.name))) {
                this.commonErrorElement.style.display = 'block';
                return;
            }

            AuthUtils.setAuthInfo(result.response.accessToken, result.response.refreshToken, {id: result.response.id, name: result.response.name})

            this.openNewRoute('/');
        }
    }
}