async function asyncCode () {
    try {
        var res = await prmTest(3)
    } catch (error) {
        console.log(error)
    }
    console.log(res)
}

callBackPromisified(5).then((msg, val) => console.log(msg, val))

function prmTest (a) {
    console.log("in prmTest")
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("timed out!");
            resolve(Number(a) * 2);
        }, 5000);
        console.log("in Promise")
    })
}

function callBackPromisified (a) {
    return new Promise((resolve, reject) => {
        callbackTest(a, (err, msg, val) => {
            console.log(val);
            resolve([msg,val]);
        });
    })
}


function callbackTest (a, cllback) {
    setTimeout(()=> cllback(null, "Called back!", a*2), 3000);
}