const Alexa = require('ask-sdk-core');
const i18n = require('i18next');

// core functionality for fact skill

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random fact by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    const randomFact = requestAttributes.t('FACTS');
    // concatenates a standard message with the random fact
    const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact + " " + requestAttributes.t('ANOTHER_ONE')   ;

    

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();

// TODO: Replace this data with your own.
// It is organized by language/locale.  You can safely ignore the locales you aren't using.
// Update the name and messages to align with the theme of your skill



const frData = {
  translation: {
    SKILL_NAME: 'Citations de Lao Tseu',
    GET_FACT_MESSAGE: 'Voici votre citation : ',
    HELP_MESSAGE: 'Avoir un but trace la voie. Vous pouvez dire donne-moi une citation, stop... Comment puis-je vous aider?',
    HELP_REPROMPT: 'Comment puis-je vous aider?',
    FALLBACK_MESSAGE: 'La skill des citations de Lao Tseu jacket ne peux pas faire cela. Je peux vous aider à découvrir des citations si vous dites par exemple, donne-moi une citation. Comment puis-je vous aider?',
    FALLBACK_REPROMPT: 'Comment puis-je vous aider?',
    ERROR_MESSAGE: 'Désolé, une erreur est survenue.',
    STOP_MESSAGE: 'La plus grande révélation est le silence. ',
    ANOTHER_ONE: 'Une autre?',
    
    FACTS:
        [
          'Si quelqu’un t’a offensé, ne cherche pas à te venger. Assieds-toi au bord de la rivière et bientôt tu verras passer son cadavre.',
          ' Savoir se contenter de ce que lon a : c’est être riche.',
          'Ceux qui savent ne parlent pas, ceux qui parlent ne savent pas. Le sage enseigne par ses actes, non par ses paroles.',
          'L’échec est le fondement de la réussite.',
          'Il n’y a point de chemin vers le bonheur. Le bonheur, c’est le chemin.',
          'Il est plus intelligent d’allumer une toute petite lampe que de se plaindre de l’obscurité.',
          'Souciez vous de ce que pensent les autres et vous serez toujours leur prisonnier.',
          'Tu es le maître des paroles que tu n’as pas prononcées ; tu es l’esclave de celles que tu laisses échapper.',
          'La rigidité et la dureté sont les compagnons de la mort. La douceur et la délicatesse sont les compagnons de la vie.',
          'Le sage ne rencontre pas de difficultés. Car il vit dans la conscience des difficultés. Et donc n’en souffre pas.',
          'La plus grande révélation est le silence.',
          'Les vraies paroles ne séduisent jamais. Les belles paroles ne sont pas vérité. Les bonnes paroles n’argumentent pas. Les arguments ne sont que discours. Celui qui sait n’a pas un grand savoir. Un grand savoir ne connaît rien.',
          'Celui qui a inventé le bateau a aussi inventé le naufrage.',
          'L’homme qui ne tente rien ne se trompe qu’une fois.',
          'Un voyage de mille lieues commence toujours par un premier pas.',
          'Sois avare de tes paroles, et les choses s’arrangeront d’elles-mêmes.',
          'Mieux vaut allumer une bougie que maudire les ténèbres.',
          'Ceux qui ne demandent rien ont tout.',
          'Le grand homme est celui qui n’a jamais perdu la vision de ses petitesses',
          'L’expérience n’est une lumière qui n’éclaire que soi-même.', 
          'Trop loin à l’est, c’est l’ouest.',
          'Quand les gros maigrissent, les maigres meurent.', 
          'Le bon voyageur n’a pas d’itinéraire et n’a pas l’intention d’arriver.', 
          'Etre courageux sans compassion mène à la mort.', 
          'Le plus grand conquérant est celui qui sait vaincre sans bataille.', 
          'Si vous croyez savoir, vous ne savez pas.', 
          'Ceux qui ont des connaissances, ne font pas de prévisions. Ceux qui prédisent, n’ont pas de connaissance.', 
          'Le but n’est pas le but, c’est la voie.', 
          'Les hommes sont différents dans la vie, semblables dans la mort.', 
          'Le sage vit dans la conscience des difficultés et n’en souffre pas.',
          'Le sage ne veut pas être estimé comme le jade, ni méprisé comme la pierre.', 
          'Le poète sait jouer sur une harpe sans cordes et il sait ensuite répondre à ceux qui prétendent n’avoir pas entendu la musique.', 
          'Inutile d’enseigner aux singes à grimper aux arbres.', 
        
      

        ],
  },
};



// constructs i18n and l10n data structure
const languageStrings = {
 
  'fr': frData,

};
