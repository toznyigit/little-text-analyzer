
function sendAnalyze(){
    var text = document.querySelector('#text-analyzer').value;
    var xhr = new XMLHttpRequest();
    var query = getAnalyzeParams();
    console.log(query);
    xhr.open("POST", `http://localhost:8080/analyze${query}`, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            var result = JSON.parse(xhr.response);
            document.querySelector('#sel-woc').innerText = `${result.wordCount === undefined ? "--" : result.wordCount}`;
            document.querySelector('#sel-nol').innerText = `${result.letters === undefined ? "--" : result.letters}`;
            document.querySelector('#sel-lan').innerText = `${result.language === undefined ? "--" : result.language}`;
            document.querySelector('#sel-dur').innerText = `${result.duration === undefined ? "--" : result.duration}`;
            document.querySelector('#sel-lon').innerText = `${result.longest === undefined ? "--" : result.longest}`;
            document.querySelector('#sel-avg').innerText = `${result.avgLength === undefined ? "--" : result.avgLength}`;
            document.querySelector('#sel-mwl').innerText = `${result.medianWordLength === undefined ? "--" : result.medianWordLength}`;
            document.querySelector('#sel-mew').innerText = `${result.medianWord === undefined ? "--" : result.medianWord}`;
            document.querySelector('#sel-cow').innerText = `${result.commonWords === undefined ? "--" : result.commonWords}`;

        }
    }
    xhr.send(JSON.stringify({"text": text}));
}

function getAnalyzeParams(){
    var inputObjects = document.querySelectorAll('label');
    var queryElement = "?analysis=";
    for (let params of Array.from(inputObjects)){
        if(params.getAttribute('checked') === 'true'){
            queryElement += params.id + ','
        }
    }
    if(queryElement[queryElement.length-1] === ',')
        queryElement = queryElement.slice(0,queryElement.length-1);
    
    return queryElement;
}

window.onload = () => {
    var labels = document.querySelectorAll('label');
    for(let l of labels){
        l.addEventListener('click', onLabelClick);
    }
}

function onLabelClick(){
    if(this.getAttribute('checked') === null || this.getAttribute('checked') === 'false'){
        this.setAttribute('checked',true);
        this.style.color = "#ffffff";
    }
    else if(this.getAttribute('checked') === 'true'){
        this.setAttribute('checked',false);
        this.style.color = "#999999";
    }
}