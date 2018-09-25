var IOTA = require('iota.lib.js');
var curl = require('curl.lib.js');
import * as sjcl from './sjcl';

var gen = new sjcl.prng(10);

document.getElementById('start-collector-js').addEventListener('click', function () {
  gen.startCollectors();
})

document.getElementById('search-transactions-js').addEventListener('click', function () {
  let container = document.getElementById('transactions-js');
  container.innerHTML = "";
  let address = document.getElementById('iota-address-transactions-js').value
  if (iota.valid.isAddress(address))
    iota.api.findTransactionObjects(
      {
        addresses: [address]
      }, function (err, res) {
        if (err)
          container.innerText = JSON.stringify(err);
        if (res.length > 0) {
          console.log(res)
          document.getElementById('transactions-js').classList.remove('invisible');
          document.getElementById('transactions-js').classList.add('visibile');
          let ul = document.createElement("ul");
          ul.classList.add('list-group');
          for (let i = 0; i < res.length; i++) {
            let child = document.createElement("li");
            child.classList.add('list-group-item');
            child.innerText = "Hash: " + res[i].hash + "\n";
            child.innerText += "Nonce: " + res[i].nonce + "\n";
            child.innerText += "Obsolete Tag: " + res[i].obsoleteTag + "\n";
            child.innerText += "Tag: " + res[i].tag + "\n";
            ul.appendChild(child)
          }
          container.appendChild(ul)
        }
      })
  else
    $('#wrong-address-modal').modal('show');
})


document.getElementById('get-balance-btn').addEventListener('click', function () {
  let address = document.getElementById('iota-address-js').value
  if (iota.valid.isAddress(address))
    iota.api.getBalances(
      [address],
      100,
      (err, response) => {
        if (err)
          console.log(err)
        else {
          document.getElementById('address-balance-js').innerText = response.balances[0] + " i";
          document.getElementById('address-balance-js').classList.remove('invisible');
          document.getElementById('address-balance-js').classList.add('visibile');
        }
      }
    );
  else
    $('#wrong-address-modal').modal('show');
})

function genSeed() {
  var seed = "";
  for (; seed.length < 81; seed += sjcl.codec.base64.fromBits(sjcl.random.randomWords(33, 10)).replace(/[^A-Z9]+/g, '')) { };
  return seed.substring(0, 81);
}

// Create IOTA instance directly with provider
var iota = new IOTA({
  provider: "https://nodes.iota.fm:443/"
});

document.getElementById('iota-version').innerText = "v " + iota.version;

sjcl.random.addEventListener("seeded", function () {
  let seed = genSeed();
  document.getElementById("seed").innerHTML = "Seed: <pre>" + seed + "</pre>";
  iota.api.getNewAddress(
    seed,
    {
      index: 0,
      security: 1
    },
    (err, res) => {
      if (err)
        console.log(err)
      else {
        console.log(res)
        let pvtkey = iota.multisig.getKey(seed, 0, 1);
        document.getElementById('public-key-generated-js').innerHTML = "Chiave Pubblica: <pre>" + res + "</pre>";
        document.getElementById('private-key-generated-js').innerHTML = "Chiave Privata: <pre>" + pvtkey + "</pre>";
      }
    }
  )
});

sjcl.random.addEventListener("progress", function (p) {
  if (p != 1) {
    document.getElementById("seed").innerText = "Sto creando entropia, muovi il tuo mouse!\nProgress: " + p * 100 + "%"
  }
});

try {
  curl.init();
  curl.overrideAttachToTangle(iota);
} catch (err) {
  console.error("Error", err);
}

iota.api.getNodeInfo((err, res) => {
  if (err) {
    document.getElementById('node-result').innerText = JSON.stringify(err)
  } else {
    document.getElementById('node-app-name').innerText = "Nome Applicazione: " + res.appName;
    document.getElementById('node-app-version').innerText = "Versione: " + res.appVersion;
    document.getElementById('node-neighbors').innerText = "Numero di nodi vicini: " + res.neighbors;
    document.getElementById('node-time').innerText = "Orario: " + new Date(res.time);
  }
})