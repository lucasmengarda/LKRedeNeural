var convnetjs = require("convnetjs");

String.prototype.replaceAll = String.prototype.replaceAll || function(needle, replacement) {
    return this.split(needle).join(replacement);
};

// species a 2-layer neural network with one hidden layer of 20 neurons
var layer_defs = [];
// input layer declares size of input. here: 2-D data
// ConvNetJS works on 3-Dimensional volumes (sx, sy, depth), but if you're not dealing with images
// then the first two dimensions (sx, sy) will always be kept at size 1
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:3});
// declare 20 neurons, followed by ReLU (rectified linear unit non-linearity)
layer_defs.push({type:'fc', num_neurons:5, activation:'relu'});
// declare the linear classifier on top of the previous hidden layer
layer_defs.push({type:'softmax', num_classes:2});

var net = new convnetjs.Net();
net.makeLayers(layer_defs);

function transformarStringEmInputs(texto){
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("-", "").replaceAll("/", "").replaceAll("(", "").replaceAll(")", "").replaceAll(",", "").replaceAll("+", "").replaceAll(" ", "").replaceAll("º", "").replaceAll(".", "").replaceAll("\n", "").replaceAll("*", "").replaceAll("ç", "c");

    //console.log("texto normalizado: " + texto);

    const construtor = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "Ç", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "&"]
    var constutorDefinitivo = {};
    for (var x = 0; x < construtor.length; x++){
        constutorDefinitivo[construtor[x]] = x
    }

    var soma = 0;

    for (let i = 0; i < texto.length; i++) {
        //console.log(constutorDefinitivo[texto.charAt(i)]);
        soma += constutorDefinitivo[texto.charAt(i)];
    }
   // console.log(soma + " " + texto);
    return soma;
}

//Entrada da Rede Neural: tem 5 sensores (categoria, preço unitário, longitude aprox., latitude aprox., descricao)

var Parse = require("parse/node");
Parse.initialize("yAfaruGpF739WZrajDcTBs0ebcvZeVrWee9JcHda", "Ph2jDAZvUmqDmYqsCiZJVmsIj84svzUvLQ0ca4vK");
Parse.serverURL = 'https://parseapi.back4app.com/';
Parse.masterKey = "JlLJOrfejFjwhtTE0GQHkFKYXIAzxkU1l0dXggmQ";

var trainer = new convnetjs.Trainer(net, {method: 'adadelta', l2_decay: 0.01, batch_size: 10});

async function treinarIAporProdutosLimve(){
    var Produtos = Parse.Object.extend("Produtos");
    var query = new Parse.Query(Produtos);
    query.limit(10000);
    var produtos = await query.find({useMasterKey:true});

    console.log(produtos.length);
    var numeroDeTreinos = 0;
    for (let x = 0; x < produtos.length; x++) {
        const produto = produtos[x];

        //console.log(JSON.stringify(produtos[x]));
        numeroDeTreinos += 1;
        const categoria = transformarStringEmInputs(produto.get("categoria"));
        const marca = transformarStringEmInputs(produto.get("marca"));
        var descricao1 = 0;
        var descricao2 = 0;
        var descricao3 = 0;

        var descricaoSplitada = produto.get("descricao").split(" ");
        if (descricaoSplitada.length > 2){
            descricao1 = transformarStringEmInputs(descricaoSplitada[0]);
            descricao2 = transformarStringEmInputs(descricaoSplitada[1]);
            descricao3 = transformarStringEmInputs(descricaoSplitada[2].replace(descricaoSplitada[0] + " " + descricaoSplitada[1] + " ", ""));
        } else if (descricaoSplitada.length > 1){
            descricao1 = transformarStringEmInputs(descricaoSplitada[0]);
            descricao2 = transformarStringEmInputs(descricaoSplitada[1].replace(descricaoSplitada[0] + " ", ""));
        } else {
            descricao1 = transformarStringEmInputs(produto.get("descricao"));
        }

        var subdescricao1 = 0;
        var subdescricao2 = 0;
        var subdescricao3 = 0;
        if (produto.get("subdescricao") != null){
            var subdescricaoSplitada = produto.get("subdescricao").split(" ");
            if (subdescricaoSplitada.length > 2){
                subdescricao1 = transformarStringEmInputs(subdescricaoSplitada[0]);
                subdescricao2 = transformarStringEmInputs(subdescricaoSplitada[1]);
                subdescricao3 = transformarStringEmInputs(subdescricaoSplitada[2].replace(subdescricaoSplitada[0] + " " + subdescricaoSplitada[1] + " ", ""));
            } else if (subdescricaoSplitada.length > 1){
                subdescricao1 = transformarStringEmInputs(subdescricaoSplitada[0]);
                subdescricao2 = transformarStringEmInputs(subdescricaoSplitada[1].replace(subdescricaoSplitada[0] + " ", ""));
            } else {
                subdescricao1 = transformarStringEmInputs(produto.get("subdescricao"));
            }
        }
        var itemRN = new convnetjs.Vol([marca, categoria, produto.get("precodevenda")]);
        trainer.train(itemRN, 0);
    }

    for (let x = 0; x < 1; x++) {
        const produto = produtos[x];

        console.log(produto.get("descricao"));

        for (var y = 0; y < 70; y++){
            //treinar mais vezes o mesmo produto
            numeroDeTreinos += 1;
            const categoria = transformarStringEmInputs(produto.get("categoria"));
            const marca = transformarStringEmInputs(produto.get("marca"));
            var descricao1 = 0;
            var descricao2 = 0;
            var descricao3 = 0;

            var descricaoSplitada = produto.get("descricao").split(" ");
            if (descricaoSplitada.length > 2){
                descricao1 = transformarStringEmInputs(descricaoSplitada[0]);
                descricao2 = transformarStringEmInputs(descricaoSplitada[1]);
                descricao3 = transformarStringEmInputs(descricaoSplitada[2].replace(descricaoSplitada[0] + " " + descricaoSplitada[1] + " ", ""));
            } else if (descricaoSplitada.length > 1){
                descricao1 = transformarStringEmInputs(descricaoSplitada[0]);
                descricao2 = transformarStringEmInputs(descricaoSplitada[1].replace(descricaoSplitada[0] + " ", ""));
            } else {
                descricao1 = transformarStringEmInputs(produto.get("descricao"));
            }

            var subdescricao1 = 0;
            var subdescricao2 = 0;
            var subdescricao3 = 0;
            if (produto.get("subdescricao") != null){
                var subdescricaoSplitada = produto.get("subdescricao").split(" ");
                if (subdescricaoSplitada.length > 2){
                    subdescricao1 = transformarStringEmInputs(subdescricaoSplitada[0]);
                    subdescricao2 = transformarStringEmInputs(subdescricaoSplitada[1]);
                    subdescricao3 = transformarStringEmInputs(subdescricaoSplitada[2].replace(subdescricaoSplitada[0] + " " + subdescricaoSplitada[1] + " ", ""));
                } else if (subdescricaoSplitada.length > 1){
                    subdescricao1 = transformarStringEmInputs(subdescricaoSplitada[0]);
                    subdescricao2 = transformarStringEmInputs(subdescricaoSplitada[1].replace(subdescricaoSplitada[0] + " ", ""));
                } else {
                    subdescricao1 = transformarStringEmInputs(produto.get("subdescricao"));
                }
            }
            var itemRN = new convnetjs.Vol([marca, categoria, produto.get("precodevenda")]);
            trainer.train(itemRN, 1);
            //trainer.train(itemRN, 1);
        }
    }

    console.log("numeroDeTreinos: " + numeroDeTreinos);


    for (let y = 0; y < 200; y++){
        const produto = produtos[y];
        const categoria = transformarStringEmInputs(produto.get("categoria"));
        const marca = transformarStringEmInputs(produto.get("marca"));
        var descricao1 = 0;
        var descricao2 = 0;
        var descricao3 = 0;

        var descricaoSplitada = produto.get("descricao").split(" ");
        if (descricaoSplitada.length > 2){
            descricao1 = transformarStringEmInputs(descricaoSplitada[0]);
            descricao2 = transformarStringEmInputs(descricaoSplitada[1]);
            descricao3 = transformarStringEmInputs(descricaoSplitada[2].replace(descricaoSplitada[0] + " " + descricaoSplitada[1] + " ", ""));
        } else if (descricaoSplitada.length > 1){
            descricao1 = transformarStringEmInputs(descricaoSplitada[0]);
            descricao2 = transformarStringEmInputs(descricaoSplitada[1].replace(descricaoSplitada[0] + " ", ""));
        } else {
            descricao1 = transformarStringEmInputs(produto.get("descricao"));
        }

        var subdescricao1 = 0;
        var subdescricao2 = 0;
        var subdescricao3 = 0;
        if (produto.get("subdescricao") != null){
            var subdescricaoSplitada = produto.get("subdescricao").split(" ");
            if (subdescricaoSplitada.length > 2){
                subdescricao1 = transformarStringEmInputs(subdescricaoSplitada[0]);
                subdescricao2 = transformarStringEmInputs(subdescricaoSplitada[1]);
                subdescricao3 = transformarStringEmInputs(subdescricaoSplitada[2].replace(subdescricaoSplitada[0] + " " + subdescricaoSplitada[1] + " ", ""));
            } else if (subdescricaoSplitada.length > 1){
                subdescricao1 = transformarStringEmInputs(subdescricaoSplitada[0]);
                subdescricao2 = transformarStringEmInputs(subdescricaoSplitada[1].replace(subdescricaoSplitada[0] + " ", ""));
            } else {
                subdescricao1 = transformarStringEmInputs(produto.get("subdescricao"));
            }
        }
        var itemRN = new convnetjs.Vol([marca, categoria, produto.get("precodevenda")]);

        var prob2 = net.forward(itemRN);

        console.log("probability de compra do item: " + produto.get("marca") + " | " + produto.get("descricao") + ": " + prob2.w[1]);
    }
}
treinarIAporProdutosLimve();
/*
var x2 = new convnetjs.Vol([0.28, 0.12, 0.1998]);


for (var xy = 0; xy < 10000; xy++){
    var numero1 = parseInt((Math.random()*30).toFixed(0));
    var numero2 = parseInt((Math.random()*12).toFixed(0));
    var numero3 = parseInt((Math.random()*20).toFixed(0));
    var numero4 = parseInt((Math.random()*99).toFixed(0));
    var numero5 = parseInt((Math.random()*1).toFixed(0));

    if (numero5 == 1){
        var x3 = new convnetjs.Vol([numero1/100, numero2/100, (numero4+1900)/10000]);
        trainer.train(x3, 1);
        trainer.train(x3, 1);
    } else {
        var x3 = new convnetjs.Vol([numero1/100, numero2/100, (numero3+2000)/10000]);
        console.log(x3);
        trainer.train(x3, 1);
        trainer.train(x3, 1);
    }
    trainer.train(x2, 0);
    net.forward(x2);

}

//net.forward(x2);
//console.log(x2);



var readline = require('readline');
var resp = "";

var leitor = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

pedeUmNumeroAoUsuario();

function pedeUmNumeroAoUsuario(){
    leitor.question("Insira algum número 1:\n", function(answer) {
        var resp1 = answer;
        leitor.question("Insira algum número 2:\n", function(answer) {
            var resp2 = answer;
            leitor.question("Insira algum número 3:\n", function(answer) {
                var resp3 = answer;
                var x = new convnetjs.Vol([parseInt(resp1)/100, parseInt(resp2)/100, parseInt(resp3)/10000]);
                var prob2 = net.forward(x);
                console.log(prob2)
                console.log("probability de " + resp1 + resp2 + resp3 + " ser a data de aniversario do lucas: " + prob2.w[0]);
                //leitor.close();
                pedeUmNumeroAoUsuario();
            });
        });
    });
}

// now prints 0.50374, slightly higher than previous 0.50101: the networks
// weights have been adjusted by the Trainer to give a higher probability to
// the class we trained the network with (zero)
*/