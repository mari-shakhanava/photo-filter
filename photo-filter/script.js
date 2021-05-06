const btnFullScreen = document.querySelector('.fullscreen');
const filtersContainer = document.querySelector('.filters');
const btnContainer = document.querySelector('.btn-container');
const filtersCollection = filtersContainer.querySelectorAll('input[type="range"]');
const inputLoadPic = document.querySelector('input[type="file"]');
const imgContainer = document.querySelector('.editor');
const currentImg = imgContainer.querySelector('img');
const canvas = document.querySelector('canvas');

const timesOfDay = ['morning/', 'day/', 'evening/', 'night/'],
    imageArray = ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg'];

let i = 0;

//fullScreen
btnFullScreen.addEventListener('click', (event) => {
    if (event.target.classList.contains('fullscreen')) {
        toggleFullScreen();
    }
});

function toggleFullScreen() {
    !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen();
}

const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) indexOfDay = 3;
    else if (hour < 12) indexOfDay = 0;
    else if (hour < 18) indexOfDay = 1;
    else indexOfDay = 2;
    return timesOfDay[indexOfDay];
}

const setFilter = (event) => {
    const suffix = event.target.dataset.sizing;
    document.documentElement.style.setProperty(`--${event.target.name}`, event.target.value + suffix);
    const parentInput = event.target.closest('label');
    const outputOfInput = parentInput.querySelector('output');
    outputOfInput.value = event.target.value;
    canvas.setAttribute(`${event.target.name}`, event.target.value + suffix);
}

const getDefaultFilterValue = (filterName) => {
    for (let i = 0; i < filtersCollection.length; i++) {
        if (filtersCollection[i].getAttribute('name') === filterName)
            return `${filtersCollection[i].dataset.default}${filtersCollection[i].dataset.sizing}`;
    }
}

const filtersNames = ['blur', 'invert', 'sepia', 'saturate', 'hue'];

const canvasSetFilterDefault = () => {
    for (let i = 0; i < filtersNames.length; i++) {
        canvas.setAttribute(filtersNames[i], `${getDefaultFilterValue(filtersNames[i])}`);
    }
}
canvasSetFilterDefault();

const resetFilters = () => {
    filtersCollection.forEach((el) => {
        document.documentElement.style.setProperty(`--${el.name}`, el.dataset.default + el.dataset.sizing);
        const currentOutput = el.closest('label').querySelector('output');
        currentOutput.value = el.dataset.default;
        el.value = el.dataset.default;
        canvasSetFilterDefault();
    })
    drawOnCanvas(currentImg.src);
}

const drawOnCanvas = (src) => {
    const img = new Image();
    img.src = src;
    img.setAttribute('crossOrigin', 'anonymous');

    const getCanvasFilterValue = () => {
        const blur = canvas.getAttribute('blur').
        split('').map(Number).
        filter((x) => !isNaN(x));
        const coeffForBlur = (img.height / currentImg.height).toFixed(2);
        console.log(img.height);
        console.log(currentImg.height);
        const invert = canvas.getAttribute('invert');
        const sepia = canvas.getAttribute('sepia');
        const saturate = canvas.getAttribute('saturate');
        const hue = canvas.getAttribute('hue');
        return `blur(${blur*coeffForBlur}px) invert(${invert}) sepia(${sepia}) saturate(${saturate}) hue-rotate(${hue})`;
    }

    const ctx = canvas.getContext("2d");

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.filter = getCanvasFilterValue();
        ctx.drawImage(img, 0, 0);
    };

    filtersContainer.oninput = () => {
        ctx.filter = getCanvasFilterValue();
        console.log(ctx.filter);
        ctx.drawImage(img, 0, 0);
    }
}

drawOnCanvas(currentImg.src);

const loadPicture = () => {
    const selectedFile = inputLoadPic.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        currentImg.src = reader.result;
        drawOnCanvas(currentImg.src);
    }
    reader.readAsDataURL(selectedFile);
    inputLoadPic.value = null;
}

const downloadPic = () => {
    const fullQuality = canvas.toDataURL('image/png', 1.0);
    console.log(fullQuality);
    const link = document.createElement('a');
    link.download = 'img.png';
    link.href = fullQuality;
    link.click();
    drawOnCanvas(currentImg.src);
}

const chooseNextPic = () => {
    getTimeOfDay();
    const indexImage = i % imageArray.length;
    let src = `https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/` +
        timesOfDay[indexOfDay] + `${imageArray[indexImage]}`;
    drawOnCanvas(src);
    viewNextImg(src);
    i++;
}

const viewNextImg = (src) => {
    const nextImg = new Image();
    nextImg.src = src;
    nextImg.onload = () => {
        currentImg.src = src;
    };
}

filtersContainer.addEventListener('input', setFilter);

btnContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-reset')) {
        resetFilters();
    }
    if (event.target.classList.contains('btn-next')) {
        chooseNextPic();
    }
    if (event.target.classList.contains('btn-save')) {
        drawOnCanvas(currentImg.src);
        downloadPic();
    }
});
inputLoadPic.addEventListener('change', loadPicture);