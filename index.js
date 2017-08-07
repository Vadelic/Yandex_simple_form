var MyForm = {

    validate: function () {
        var result = {isValid: true, errorFields: []};

        function addInvalidField(key) {
            result.isValid = false;
            result.errorFields.push(key);
        }

        function isValidRegex(value, pattern) {
            return pattern.test(value);
        }

        function checkSum(phone, max) {
            var sum = 0;
            for (var i = 0; i < phone.length; i++) {
                var symbol = phone.charAt(i);
                var number = parseInt(symbol);
                if (!isNaN(number)) {
                    sum += number;
                    if (sum > max)
                        return false;
                    // console.log(number + " " + sum)
                }
            }
            return true;
        }

        var data = this.getData();

        for (var field in data) {
            if (!data.hasOwnProperty(field)) continue;
            switch (field) {
                case 'fio':
                    if (!isValidRegex(data[field], new RegExp(/^\w+ +\w+ +\w+$/))) {
                        addInvalidField(field);
                    }
                    break;
                case 'email':
                    if (!isValidRegex(data[field], new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)$/i))) {
                        addInvalidField(field);
                    }
                    break;
                case 'phone':
                    if (!(isValidRegex(data[field], new RegExp(/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/)) && checkSum(data[field], 30))) {
                        addInvalidField(field);
                    }
                    break;
            }
        }
        return result;

    }
    ,

    getData: function () {
        var data = {};
        var form = document.forms['myForm'];
        for (var i = 0; i < form.length; i++) {
            if (form[i].name != "") {
                data[form[i].name] = form[i].value;
            }
        }
        return data;
    }
    ,

    setData: function (Object) {
        var availableFields = ['phone', 'fio', 'email'];
        var form = document.forms['myForm'];

        for (var key in Object) {
            if (!Object.hasOwnProperty(key)) continue;

            if (availableFields.indexOf(key) != -1) {
                form.elements[key].value = Object[key].trim();
            }
        }
    }
    ,

    submit: function () {
        function markErrorClass(errorFields) {
            var form = document.forms['myForm'];
            for (var i = 0; i < form.length; i++) {

                if (form[i].name != "" && errorFields.indexOf(form[i].name) != -1) {
                    form[i].classList.add("error");
                } else {
                    form[i].classList.remove("error");
                }
            }
        }

        var validate = this.validate();
        markErrorClass(validate.errorFields);
        if (validate.isValid) {
            var resultContainer = document.getElementById("resultContainer");
            resultContainer.classList.remove('error');
            resultContainer.classList.remove('success');
            resultContainer.innerHTML = "";
            document.getElementById("submitButton").disabled = true;
            var action = document.getElementById("myForm").action;
            runAction(action);
        }
        return false;
    }
};

function runAction(url) {
    function initXMLHttpRequest() {
        try {
            var request = new XMLHttpRequest();
        } catch (e1) {
            try {
                request = new ActiveXObject("Msxm12.XMLHTTP")
            } catch (e2) {
                try {
                    request = new ActiveXObject("Microsoft.XMLHTTP")
                } catch (e3) {
                    request = false;
                }
            }
        }
        return request;
    }

    function getObjectFromResponse(text) {
        var response = {};
        try {
            response = JSON.parse(text);
        } catch (e) {
            alert("ajax не получил объект и ответ был сгенерирован случайным образом");
            var variableResponse = [
                {"status": "progress", "timeout": 5000},
                {"status": "error", "reason": "Error message"},
                {"status": "success"}
            ];
            var number = Math.floor(Math.random() * (3));
            response = variableResponse[number];
        }
        return response;
    }
    
    var submitButton = document.getElementById("submitButton");
    var resultContainer = document.getElementById("resultContainer");
    
    var xhr = initXMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            
            if (this.status == 200) {
                var response = getObjectFromResponse(this.responseText);
                switch (response.status) {
                    case 'progress':
                        resultContainer.classList.add("progress");
                        setTimeout(function () {
                            runAction(url)
                        }, response.timeout);
                        break;
                    case 'error':
                        resultContainer.classList.remove("progress");
                        resultContainer.classList.add("error");
                        resultContainer.innerHTML = response.reason;
                        submitButton.disabled = false;
                        break;
                    case 'success':
                        resultContainer.classList.remove("progress");
                        resultContainer.classList.add("success");
                        resultContainer.innerHTML = "Success";
                        submitButton.disabled = false;
                        break;
                    default:
                        alert("в ответе неизвестный статус " + response.status);
                        submitButton.disabled = false;
                }
            } else {
                alert(url + "\nresponse status " + this.status + "\n submit button is enabled");
                submitButton.disabled = false;
            }
        }
    };
    xhr.send(null);
}