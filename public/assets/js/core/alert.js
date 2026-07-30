/* ==========================================
   LMS PROFESSIONAL ALERT SYSTEM
   Version 1.0
========================================== */

let alertConfirmCallback = null;

// ---------- Create Modal ----------

(function () {

    if (document.getElementById("lmsAlertOverlay")) return;

    document.body.insertAdjacentHTML("beforeend", `

<div class="alert-overlay" id="lmsAlertOverlay">

    <div class="alert-box">

        <div id="alertIcon" class="alert-icon alert-success">✓</div>

        <div id="alertTitle" class="alert-title">
            Success
        </div>

        <div id="alertMessage" class="alert-message">
            Message
        </div>

        <div id="alertFooter" class="alert-footer">

        </div>

    </div>

</div>

`);

})();

// ---------- Helpers ----------

const overlay = document.getElementById("lmsAlertOverlay");
const icon = document.getElementById("alertIcon");
const title = document.getElementById("alertTitle");
const message = document.getElementById("alertMessage");
const footer = document.getElementById("alertFooter");

function closeAlert(){

    overlay.classList.remove("show");

}

function buildButton(text, className, click){

    const btn=document.createElement("button");

    btn.className="alert-btn "+className;

    btn.innerHTML=text;

    btn.onclick=click;

    return btn;

}

function showBase(type, symbol, titleText, msg){

    overlay.classList.add("show");

    icon.className="alert-icon "+type;

    icon.innerHTML=symbol;

    title.innerHTML=titleText;

    message.innerHTML=msg;

    footer.innerHTML="";

}

// =====================================
// SUCCESS
// =====================================

function showSuccess(titleText,msg){

    showBase(
        "alert-success",
        "✓",
        titleText,
        msg
    );

    footer.appendChild(

        buildButton(
            "Continue",
            "alert-btn-primary",
            closeAlert
        )

    );

}

// =====================================
// ERROR
// =====================================

function showError(titleText,msg){

    showBase(
        "alert-error",
        "X",
        titleText,
        msg
    );

    footer.appendChild(

        buildButton(
            "Close",
            "alert-btn-danger",
            closeAlert
        )

    );

}

// =====================================
// WARNING
// =====================================

function showWarning(titleText, msg){

    showBase(
        "alert-success",
        "!",
        titleText,
        msg
    );

    footer.innerHTML = "";

    footer.appendChild(
        buildButton(
            "OK",
            "alert-btn-primary",
            closeAlert
        )
    );

}
// =====================================
// INFO
// =====================================

function showInfo(titleText,msg){

    showBase(
        "alert-info",
        "i",
        titleText,
        msg
    );

    footer.appendChild(

        buildButton(
            "Close",
            "alert-btn-primary",
            closeAlert
        )

    );

}

// =====================================
// CONFIRM
// =====================================

function showConfirm(titleText,msg,onConfirm){

    alertConfirmCallback=onConfirm;

    showBase(
        "alert-warning",
        "?",
        titleText,
        msg
    );

    footer.appendChild(

        buildButton(
            "Cancel",
            "alert-btn-secondary",
            closeAlert
        )

    );

    footer.appendChild(

        buildButton(
            "Delete",
            "alert-btn-danger",
            function(){

                closeAlert();

                if(typeof alertConfirmCallback==="function"){

                    alertConfirmCallback();

                }

            }
        )

    );

}

// =====================================
// LOADING
// =====================================

function showLoading(msg="Please wait..."){

    overlay.classList.add("show");

    icon.className="";

    icon.innerHTML='<div class="alert-spinner"></div>';

    title.innerHTML="Loading";

    message.innerHTML=msg;

    footer.innerHTML="";

}

function hideLoading(){

    closeAlert();

}

//==============================
// Toast Notification
//==============================

(function(){

    if(document.getElementById("toastContainer")) return;

    document.body.insertAdjacentHTML(

        "beforeend",

        `<div class="toast-container" id="toastContainer"></div>`

    );

})();

function showToast(type,title,message){

    const container=document.getElementById("toastContainer");

    const toast=document.createElement("div");

    let icon="&#10003;";

    let bg="toast-success";

    switch(type){

        case "error":

            icon="X";

            bg="toast-error";

            break;

        case "warning":

            icon="!";

            bg="toast-warning";

            break;

        case "info":

            icon="i";

            bg="toast-info";

            break;

    }

    toast.className="toast";

    toast.innerHTML=`

        <div class="toast-icon ${bg}">
            ${icon}
        </div>

        <div>

            <div class="toast-title">

                ${title}

            </div>

            <div class="toast-message">

                ${message}

            </div>

        </div>

    `;

    container.appendChild(toast);

    setTimeout(()=>{

        toast.style.animation="toastOut .30s forwards";

        setTimeout(()=>{

            toast.remove();

        },300);

    },2500);

}