var $ = require('jquery');
var _ = require('underscore');

$(function() {

  if ($('body').hasClass('article'))
    return;

  var demographicQuestions = require('./questions').demographics
  var demographicTemplate = _.template(require('./demographic_template.ejs'));
  var demographicHTML = _(demographicQuestions).map(function(q) {
    return demographicTemplate(q);
  }).join('');

  var quizQuestions = require('./questions').quiz;
  var quizTemplate = _.template(require('./quiz_template.ejs'));
  var quizHTML = _(quizQuestions).map(function(q) {
    return quizTemplate(q);
  }).join('');

  // add templated demographics questions
  $('.demographics .question-container').append(demographicHTML);
  $('.demographics .question').first().addClass('shown');

  // this fades in the background under the demographics modal
  $('.intro').addClass('shown');

  // answers to demographics
  var timer = false;
  var demographicsDone = false;
  $('body').on('click', '.demographics .answer', function(e) {
    if (timer)
      return;
    timer = true;    
    _(function() { timer = false; }).delay(800);

    var $question = $(e.target).parents('.question');
    var answer = e.target.textContent.toLowerCase().trim();

    // gender
    if ($question.index() === 0)
      ga('set', 'dimension1', answer); 
    // age bracket
    else
      ga('set', 'dimension2', answer);
 
    var $next = $question.next();
    if ($next.length === 0) {
      $('.demographics').removeClass('shown');
      demographicsDone = true;
      _(function() { $('.demographics').remove(); }).delay(800);
    }
    else {
      $question.removeClass('shown');
      $next.addClass('shown');
    }

  });

  // add these two lines to skip demographics:
  // $('.demographics').remove();
  // demographicsDone = true;


  // templated quiz questions
  $('.quiz').prepend(quizHTML);

  var label, correctIndex, chosenIndex;

  var correct = 0;
  var current = 0;

  var iconCorrect = require('./correct.ejs');
  var iconIncorrect = require('./incorrect.ejs');

  var waiting = false;

  // first quiz slide show with .begin button
  $('.begin').on('click', function(e) {
    if (!demographicsDone)
      return;
    else {
      $('.quiz').css({transform: 'translateY(-100%)'});
      $('.quiz .slide').first().addClass('current');

      // swap lines above for these to jump to end of quiz:
      // $('.quiz').css({transform: 'translateY(-900%)'});
      // $('.quiz .slide').eq(8).addClass('current');
      // correct = 7;
      // current = 8;
    }
  });


  // quiz slides
  $('body').on('click', '.quiz .answer', function(e) {

    // prevents click more than once and changing the answer
    if (waiting)
      return;

    waiting = true;

    correctIndex = quizQuestions[current].correct;
    chosenIndex = $(e.target).closest('.answer').index();

    // this is short version used for Google Analytics
    label = quizQuestions[current].label;

    if (correctIndex === chosenIndex)
      indicateCorrect();
    else
      indicateIncorrect();

    console.log('wtf');
    _(advanceQuiz).delay(2500);
  });


  function indicateCorrect() {
    correct += 1;
    $('.quiz .slide.current .result').text('Correcto!').css({opacity: 1});
    $('.quiz .slide.current .answer').eq(chosenIndex).prepend(iconCorrect);
    $('.quiz .slide.current .mark').css({opacity: 1});
    ga('send', 'event', label, 'correct', label, 1);
  };

  function indicateIncorrect() {
    $('.quiz .slide.current .result').text('Equivocado!').css({opacity: 1});
    $('.quiz .slide.current .answer').eq(correctIndex).prepend(iconCorrect);
    $('.quiz .slide.current .answer').eq(chosenIndex).prepend(iconIncorrect);
    $('.quiz .slide.current')[0].offsetHeight;
    $('.quiz .slide.current .mark').css({opacity: 1});
    ga('send', 'event', label, 'incorrect', label, 0);
  };

  function advanceQuiz() {
    waiting = false;

    current += 1;

    $('.progress-bar').css({transform: 'scale(' + (current / 9) + ', 1)'});

    $('.quiz .slide')
      .removeClass('current')
      .eq(current).addClass('current');
   
    var pos = (current+1) * -100 + '%';
    $('.quiz').css({transform: 'translateY(' + pos + ')'});

    // reached the end
    if (current === 9) {

      var $text;
      if (correct <= 3)
        $text = $('.text.for-0-3-correct');
      else if (correct <= 6)
        $text = $('.text.for-4-6-correct');
      else
        $text = $('.text.for-7-9-correct');

      $text.prepend('<h4>Contestaste ' + correct + ' de 9 correctamente!</h4>').addClass('shown');

    }

  }

});


// works everywhere including article pages
$(function() {

  $('body').on('click', '.social-icons .icon', function(e) {
    var $icon = $(e.target).closest('.icon');

    var shortMessage = '¿Cuál es tu IQ de fraude?';
    var longMessage = '¿Te crees bastante listo cuando se trata de fraude y tu seguridad financiera? Pon tu conocimiento a prueba con estas preguntas para determinar tu verdadero IQ de fraude.';

    if ($icon.is('.facebook')) {
      shareUrl = (
        'https://www.facebook.com/sharer/sharer.php?u='
          + encodeURIComponent(location.href)
      );
    }
    else if ($icon.is('.twitter')) {
      shareUrl = (
        'https://twitter.com/intent/tweet' +
        '?text=' + shortMessage +
        '&url=' + encodeURIComponent(location.href)
      );
    }
    else if ($icon.is('.email')) {
      shareUrl = (
        'mailto:' +
        '?subject=' + encodeURIComponent(shortMessage) +
        '&body=' + longMessage + encodeURIComponent('\n\n' + location.href)
      );
    }

    window.open(shareUrl, '_blank');
  });

});
