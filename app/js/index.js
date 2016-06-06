window.$ = require('jquery');
var _ = require('underscore');

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

$(function() {

  // add templated demographics questions
  $('.demographics').append(demographicHTML);
  $('.demographics .question').first().addClass('shown');

  // this fades in the background under the demographics modal
  $('.intro').addClass('shown');

  // answers to demographics
  var timer = false;
  var demographicsDone = false;
  $('body').on('click .demographics .answer', function(e) {
    if (timer) return;
    var $question = $(e.target).parents('.question');
    var $next = $question.next();

    timer = true;    
    _(function() { timer = false; }).delay(800);

    if ($next.length === 0) {
      $('.demographics').removeClass('shown');
      _(function() { $('.demographics').remove(); }).delay(800);
    }
    else {
// ga('set', 'dimension1', dimensionValue); // gender
// ga('set', 'dimension2', dimensionValue); // age bracket
      $question.removeClass('shown');
      $next.addClass('shown');
    }

  });

  // add these two lines to skip demographics:
  $('.demographics').remove();
  demographicsDone = true;

  // first quiz slide show with .begin button
  $('.begin').on('click', function(e) {
    if (!demographicsDone)
      return;
    else {
      $('.quiz').css({transform: 'translateY(-100%)'});
      $('.quiz .slide').first().addClass('current');
    }
  });


  // templated quiz questions
  $('.quiz').append(quizHTML);

  var correct = 0;
  var current = 0;

  var iconCorrect = require('./correct');
  var iconIncorrect = require('./incorrect');

  // quiz slides
  $('body').on('click', '.quiz .answer', function(e) {

    var correctIndex = quizQuestions[current].correct;
    // -1 because of the h4 above the .answer divs
    var chosenIndex = $(e.target).closest('.answer').index() - 1;
    console.log({correctIndex, chosenIndex});

    // this is short version used for Google Analytics
    var label = quizQuestions[current].label;

    if (correctIndex === chosenIndex) {
      correct += 1;
      ga('send', 'event', label, 'correct', label, 1);

    }
    else {
      ga('send', 'event', label, 'incorrect', label, 0);

    }

    // advance the quiz
    current += 1;
    if (current <= 9) {

      $('.progress-bar').css({transform: 'scale(' + (current / 9) + ', 1)'});

      $('.quiz .slide')
        .removeClass('current')
        .eq(current).addClass('current');
     
      var pos = (current+1) * -100 + '%';
      $('.quiz').css({transform: 'translateY(' + pos + ')'});
    }

    // show scores
    else {


      console.log('done');
    }

  });

});

