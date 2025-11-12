import {HttpUtils} from "../../utils/http-utils.js";
import config from "../../config/config.js";
import {CommonUtils} from "../../utils/common-utils.js";
import {FileUtils} from "../../utils/file-utils.js";

export class OrdersEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('updateButton').addEventListener('click', this.updateOrder.bind(this));

        this.freelamcerSelectElement = document.getElementById('freelancerSelect');
        this.statusSelectElement = document.getElementById('statusSelect');
        this.descriptionInputElement = document.getElementById('descriptionInput');
        this.amountInputElement = document.getElementById('amountInput');
        this.scheduledCardElement = document.getElementById('schedule-card');
        this.completeCardElement = document.getElementById('complete-card');
        this.deadlineCardElement = document.getElementById('deadline-card');


        this.scheduledDate = null;
        this.deadlineDate = null;
        this.completeDate = null;

        this.calendarScheduled = $('#calendar-scheduled');
        this.calendarDeadline =  $('#calendar-deadline');
        this.calendarComplete =  $('#calendar-complete');

        this.init(id).then();

        // bsCustomFileInput.init();


    }

    async init(id) {
        const orderData = await this.getOrder(id);
        if(orderData && orderData.freelancer) {
            this.showOrder(orderData);
            if(orderData.freelancer) {
                await this.getFreelancers(orderData.freelancer.id);
            }
        }
    }

    async getOrder(id) {
        const result = await HttpUtils.request('/orders/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе заказа');
        }

        this.orderOriginalDate = result.response;

        return result.response;
    }



    async getFreelancers(currentFreelancerId) {
        const result = await HttpUtils.request('/freelancers');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response.freelancers))) {
            return alert('Возникла ошибка при запросе фрилансеров');
        }

        const freelancers = result.response.freelancers;

        for (let i = 0; i < freelancers.length; i++) {
            const option = document.createElement("option");
            option.value = freelancers[i].id;
            option.innerText = freelancers[i].name + ' ' + freelancers[i].lastName;
            if(currentFreelancerId === freelancers[i].id) {
                option.selected = true;
            }

            this.freelamcerSelectElement.appendChild(option);
        }

        $(this.freelamcerSelectElement).select2({
            theme: 'bootstrap4'
        })
    }

    showOrder(order) {
        const breadcrumbsElement = document.getElementById('breadcrumbs-order');
        breadcrumbsElement.href = '/orders/view?id=' + order.id;
        breadcrumbsElement.innerText = order.number;

        this.amountInputElement.value = order.amount;
        this.descriptionInputElement.value = order.description;
        for (let i = 0; i < this.statusSelectElement.options.length; i++) {
            if (this.statusSelectElement.options[i].value === order.status) {

                this.statusSelectElement.selectedIndex = i;
            }
        }

        this.calendarScheduled.datetimepicker({
            inline: true,
            locale: 'ru',
            icons: {
                time: 'far fa-clock',
            },
            useCurrent: false,
            date: order.scheduledDate,
        })

        this.calendarScheduled.on("change.datetimepicker",  (e) => {
            this.scheduledDate = e.date;
        })

        this.calendarComplete.datetimepicker({
            inline: true,
            locale: 'ru',
            icons: {
                time: 'far fa-clock',
            },
            buttons: {
                showClear: true,
            },
            useCurrent: false,
            date: order.completeDate,
        })

        this.calendarComplete.on("change.datetimepicker", (e) => {
            if(e.date) {
                this.completeDate = e.date;
            } else if(this.orderOriginalDate.completeDate) {
                this.completeDate = false;
            } else {
                this.completeDate = null;
            }
        })

        this.calendarDeadline.datetimepicker({
            inline: true,
            locale: 'ru',
            icons: {
                time: 'far fa-clock',
            },
            useCurrent: false,
            date: order.deadlineDate,
        })

        this.calendarDeadline.on("change.datetimepicker", (e) => {
            this.deadlineDate = e.date;
        })
    }

    validateForm() {
        let isValid = true;

        let textInputArray = [this.descriptionInputElement, this.amountInputElement];

        for (let i = 0; i < textInputArray.length; i++) {
            if (textInputArray[i].value) {
                textInputArray[i].classList.remove('is-invalid');
            } else {
                textInputArray[i].classList.add('is-invalid');
                isValid = false;
            }
        }
        return isValid;
    }

    async updateOrder(e) {
        e.preventDefault();

        if (this.validateForm()) {
            const changedData = {};
            if (parseInt(this.amountInputElement.value) !== parseInt(this.orderOriginalDate.amount)) {
                changedData.amount = parseInt(this.amountInputElement.value);
            }
            if (this.descriptionInputElement.value !== this.orderOriginalDate.description) {
                changedData.description = this.descriptionInputElement.value;
            }
            if (this.statusSelectElement.value !== this.orderOriginalDate.status) {
                changedData.status = this.statusSelectElement.value;
            }
            if (this.freelamcerSelectElement.value !== this.orderOriginalDate.freelancer.id) {
                changedData.freelancer = this.freelamcerSelectElement.value;
            }

            if(this.completeDate || this.completeDate === false) {
                changedData.completeDate = this.completeDate ? this.completeDate.toISOString() : null;
            }



            if(this.deadlineDate) {
                changedData.deadlineDate = this.deadlineDate.toISOString();
            }
            if(this.scheduledDate) {
                changedData.scheduledDate = this.scheduledDate.toISOString();
            }

            if(Object.keys(changedData).length > 0) {
                const result = await HttpUtils.request('/orders/' + this.orderOriginalDate.id, 'PUT', true, changedData);

                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                if (result.error || !result.response || (result.response && result.response.error)) {
                    return alert('Возникла ошибка при редактировании заказа');
                }

                return this.openNewRoute('/orders/view?id=' + this.orderOriginalDate.id);
            }
        }
    }
}