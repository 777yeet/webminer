if(!window.allowAds) {
  $('#startMiner').prop("disabled", true).val("Please disable AdBlock and reload");
  $('#status_section').hide();
}

try {
  var miner = new CH.Anonymous(window.address, {throttle: 0.3}), stats = {};
} catch(err) {
  setTimeout(function() {
    location.reload();
  }, 3000);
}

const rewardHash = {
  etn: 100,
  xmr: 1000000000000,
  bcn: 1,
  aeon: 1,
  duck: 1,
  dash: 1,
  fcn: 1,
  trtl: 1,
  coins: 1
};

function getMinedCoins (days) {
  let difficulty = stats.difficulty,
      hashes = parseInt($('#hashesPerSecond').text()),
      reward = stats.reward / rewardHash[window.currency],
      minedCoins = (((reward/difficulty) * hashes * days) || 0).toFixed(6);

  return `${minedCoins} ${window.currency}`;
}

function getMiningStatus () {
  return miner.isRunning() === true ? 'Running' : 'Stopped';
}

function getDifficulty () {
  return stats.difficulty || 22563603749;
}

function setDefaults () {
  $('#hashesPerSecond').html(miner.getHashesPerSecond().toFixed(2));
  $('#totalHashes').html(miner.getTotalHashes());
  $('#acceptedHashes').html(0);
  $('#difficulty').html(getDifficulty());
  $('#numThreads').val(miner.getNumThreads());
  $('#throttle').val((100 - miner.getThrottle() * 100));
  $('#minedCoins').html(getMinedCoins());
  $('#address').html(window.address);
  $('#poolUrl').html(window.pool);
  $('#poolPort').html(window.port);
}

function getStats () {
  $.get(window.apiUrl, function(data) {
    stats = data.network || data;
    $('#difficulty').html(getDifficulty());
    $('#daily').html(getMinedCoins(86400));
    $('#weekly').html(getMinedCoins(604800));
    $('#monthly').html(getMinedCoins(2592000));
  });
};

$('#startMiner').on('click', function() {
  miner.start();
});

$('#stopMiner').on('click', function() {
  miner.stop();
  $('#startMiner').removeClass('hide');
  $('#stopMiner').addClass('hide');
});

$('#numThreads').on('blur', function(event) {
  var value = event.target.value;
  miner.setNumThreads(value);
});

$('#throttle').on('blur', function(event) {
  console.log(event.target.value);
  var value = event.target.value;
  miner.setThrottle((100 - value)/100);
});

$(document).ready(function() {
  var intervalId;

  miner.on('open', function(params) {
    console.log('miner open');
    $('#startMiner').addClass('hide');
    $('#stopMiner').removeClass('hide');
    $('#difficulty').html(getDifficulty());
    intervalId = setInterval(function() {
      $('#hashesPerSecond').html(miner.getHashesPerSecond().toFixed(2));
      $('#totalHashes').html(miner.getTotalHashes());
    }, 1000);
  });

  miner.on('accepted', function() {
    $('#acceptedHashes').html($('#totalHashes').text());
  });

  miner.on('close', function(params) {
    clearInterval(intervalId);
  });

  setDefaults();
  getStats();
  setInterval(function () {
      getStats();
  }, 30000);
});

