import {HttpUtils} from "../../utils/http-utils";
import config from "../../config/config";
import {CommonUtils} from "../../utils/common-utils";
import {FileUtils} from "../../utils/file-utils";

export class FreelancersEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('updateButton').addEventListener('click', this.updateFreelancer.bind(this));
        bsCustomFileInput.init();

        this.nameInputElement = document.getElementById('nameInput');
        this.lastNameInputElement = document.getElementById('lastNameInput');
        this.emailInputElement = document.getElementById('emailInput');
        this.educationInputElement = document.getElementById('educationInput');
        this.locationInputElement = document.getElementById('locationInput');
        this.skillsInputElement = document.getElementById('skillsInput');
        this.infoInputElement = document.getElementById('infoInput');
        this.levelSelectElement = document.getElementById('levelSelect');
        this.avatarInputElement = document.getElementById('avatarInput');

        this.getFreelancer(id).then();
    }

    async getFreelancer(id) {
        const result = await HttpUtils.request('/freelancers/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе фрилансеров');
        }

        this.freelancerOriginalDate = result.response;
        this.showFreelancer(result.response);
    }

    showFreelancer(freelancer) {
        const breadcrumbsElement = document.getElementById('breadcrumbs-freelancer');
        breadcrumbsElement.href = '/freelancers/view?id=' + freelancer.id;
        breadcrumbsElement.innerText = freelancer.name + ' ' + freelancer.lastName;

        if (freelancer.avatar) {
            document.getElementById('avatar').src = config.host + freelancer.avatar;
        }

        document.getElementById('level').innerHTML = CommonUtils.getLevelHtml(freelancer.level);

        this.nameInputElement.value = freelancer.name;
        this.lastNameInputElement.value = freelancer.lastName;
        this.emailInputElement.value = freelancer.email;
        this.educationInputElement.value = freelancer.education;
        this.locationInputElement.value = freelancer.location;
        this.skillsInputElement.value = freelancer.skills;
        this.infoInputElement.value = freelancer.info;

        for (let i = 0; i < this.levelSelectElement.options.length; i++) {
            if (this.levelSelectElement.options[i].value === freelancer.level) {

                this.levelSelectElement.selectedIndex = i;
            }
        }
    }

    validateForm() {
        let isValid = true;

        let textInputArray = [this.nameInputElement, this.lastNameInputElement, this.educationInputElement, this.locationInputElement, this.skillsInputElement, this.infoInputElement];

        for (let i = 0; i < textInputArray.length; i++) {
            if (textInputArray[i].value) {
                textInputArray[i].classList.remove('is-invalid');
            } else {
                textInputArray[i].classList.add('is-invalid');
                isValid = false;
            }
        }

        if (this.emailInputElement.value && this.emailInputElement.value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/)) {
            this.emailInputElement.classList.remove('is-invalid');
        } else {
            this.emailInputElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async updateFreelancer(e) {
        e.preventDefault();

        if (this.validateForm()) {
            const changedData = {};
            if (this.nameInputElement.value !== this.freelancerOriginalDate.name) {
                changedData.name = this.nameInputElement.value;
            }
            if (this.lastNameInputElement.value !== this.freelancerOriginalDate.lastName) {
                changedData.lastName = this.lastNameInputElement.value;
            }
            if (this.emailInputElement.value !== this.freelancerOriginalDate.email) {
                changedData.email = this.emailInputElement.value;
            }
            if (this.educationInputElement.value !== this.freelancerOriginalDate.education) {
                changedData.education = this.educationInputElement.value;
            }
            if (this.locationInputElement.value !== this.freelancerOriginalDate.location) {
                changedData.location = this.locationInputElement.value;
            }
            if (this.skillsInputElement.value !== this.freelancerOriginalDate.skills) {
                changedData.skills = this.skillsInputElement.value;
            }
            if (this.infoInputElement.value !== this.freelancerOriginalDate.info) {
                changedData.info = this.infoInputElement.value;
            }
            if (this.levelSelectElement.value !== this.freelancerOriginalDate.level) {
                changedData.level = this.levelSelectElement.value;
            }
            if (this.avatarInputElement.files && this.avatarInputElement.files.length > 0) {
                changedData.avatarBase64 = await FileUtils.convertFileToBase64(this.avatarInputElement.files[0]);
            }

            if(Object.keys(changedData).length > 0) {
                const result = await HttpUtils.request('/freelancers/' + this.freelancerOriginalDate.id, 'PUT', true, changedData);

                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                if (result.error || !result.response || (result.response && result.response.error)) {
                    return alert('Возникла ошибка при редактировании фрилансеров');
                }

                return this.openNewRoute('/freelancers/view?id=' + this.freelancerOriginalDate.id);
            }
        }
    }
}