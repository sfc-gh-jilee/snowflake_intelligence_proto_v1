const main = () => {
    const viewApp = document.querySelector('#app');

    const btnShowAgentDetails = document.querySelector('#showAgentDetails');
    const btnHideAgentDetails = document.querySelector('#hideAgentDetails');
    const viewAgentDetails = document.querySelector('#details');
    var isAgentDetailsVisible = false;
    const toggleAgentDetails = () => {
        if (isAgentDetailsVisible) {
            viewApp.classList.remove('details');
            viewAgentDetails.classList.remove('on');
            isAgentDetailsVisible = false;
        }
        else {
            viewApp.classList.add('details');
            viewAgentDetails.classList.add('on');
            isAgentDetailsVisible = true;
        }
    };
    btnShowAgentDetails.addEventListener('click', toggleAgentDetails, false);
    btnHideAgentDetails.addEventListener('click', toggleAgentDetails, false);
};

const toggleExpando = (e) => {
    e.target.classList.toggle('expanded');
};

window.addEventListener('load', main, false);