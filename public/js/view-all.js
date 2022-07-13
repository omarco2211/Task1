// Fetch all the forms we want to apply custom Bootstrap validation styles to
const form = document.querySelector('.needs-validation')
const cards = document.querySelectorAll(".card");
cards.forEach((card, i) => {
    card.addEventListener("click", (event) => {
        event.preventDefault();
        const data = {
            id: card.id
        };
        const xhr = new XMLHttpRequest();
        xhr.open("put", "/view-all", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
        xhr.onload = function() {
            var data = JSON.parse(xhr.responseText);
            if (data.err) {
                throw new error("Error when getting client data!!");
            } else {
                document.querySelector("#staticName").value = data.name;
                document.querySelector("#staticEmail").value = data.email;
                document.querySelector("#staticAcc").value = data.accountid;
                document.querySelector("#staticBal").value = data.balance;
            }
        }
    });

});
document.querySelector(".transferbtn").addEventListener("click", (event) => {
    if (!form.checkValidity()) {
        event.stopPropagation();
    }
    event.preventDefault();
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));
    const xhr = new XMLHttpRequest();
    xhr.open("post", "/view-all", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
    xhr.onload = function() {
        var data = JSON.parse(xhr.responseText);
        if (data.err === "account") {
            document.querySelector("#staticTransferAcc").classList.add("is-invalid");
            document.querySelector("#staticTransferAccFeedback").innerHTML = data.message;
        } else if (data.err === "balance") {
            document.querySelector("#staticTransferBal").classList.add("is-invalid");
            document.querySelector("#staticTransferBalFeedback").innerHTML = data.message;

        } else {
            form.classList.add('was-validated');
            document.querySelector("#staticName").value = data.body.name;
            document.querySelector("#staticEmail").value = data.body.email;
            document.querySelector("#staticAcc").value = data.body.id;
            document.querySelector("#staticBal").value = data.body.balance;
            const closebtn = document.querySelector(".close");
            closebtn.click();
            alert(data.message);

        }
    }
});
document.querySelector(".modal").addEventListener("hidden.bs.modal", (event) => {
    form.classList.remove('was-validated');
    document.querySelector("#staticTransferAcc").classList.remove("is-invalid");
    document.querySelector("#staticTransferBal").classList.remove("is-invalid");
    document.querySelector("#staticTransferAccFeedback").innerHTML = "Account Number is Required!";
    document.querySelector("#staticTransferBalFeedback").innerHTML = "Balance is Required!";
    document.querySelector("#staticTransferBal").value = "";
    document.querySelector("#staticTransferAcc").value = "";
});
