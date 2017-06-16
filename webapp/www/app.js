function _checkOnline()
{
    var online = navigator.onLine;
    if (online)
    {
        $('.is-online').removeClass('offline').addClass('online').attr('title', 'You are online');
        $('a[href="#synchronize-page"]').removeClass('disabled');
    } else
    {
        $('.is-online').removeClass('online').addClass('offline').attr('title', 'Offline !');
        $('a[href="#synchronize-page"]').addClass('disabled');

    }
}

function load_tpl()
{
    var TTpl = [
                ['tpl/nav.html', 'body']
                , ['tpl/config.html', '#container']
                , ['tpl/home.html', '#container']
                , ['tpl/product.html', '#container']
                , ['tpl/thirdparty.html', '#container']
                , ['tpl/proposal.html', '#container']
                , ['tpl/propal_product.html', '#container']
                , ['tpl/contact.html', '#container']
                , ['tpl/formtosenddata.html', 'body']
    ];

    tpl_append(TTpl);
}
/*
 * ???
 * @param {type} TTpl  list of container
 * @returns {undefined}
 */
function tpl_append(TTpl)
{
    if (TTpl.length > 0)
    {
        $.get(TTpl[0][0], function (data)
        {
            $(TTpl[0][1]).prepend(data);
            applyAllTrans();
            TTpl.splice(0, 1);
            tpl_append(TTpl);
        });
    } else
    {
        init();
    }
}
/*
 * use varaible localstorage to test if already exist connexion information and if it's true copy it in their input
 *
 * @returns {undefined}
 */
function init()
{
    if (localStorage.interface_url)
    {
        if (localStorage.domain)
            $('#domain').val(localStorage.domain);
        if (localStorage.interface_url)
            $('#interface_url').val(localStorage.interface_url);
        if (localStorage.dolibarr_login) {
            $('#dolibarr_login').val(localStorage.dolibarr_login);
        }
        if (localStorage.dolibarr_password) {
            $('#dolibarr_password').val(localStorage.dolibarr_password);
        }
    } else
    {
        $('#navigation a[href="#config"]').tab('show');
    }

    $('input[name=camit]').change(function () {
        alert(this.value);
    });

    window.setInterval(function () {
        _checkOnline();
    }, 10000); // 10s

    // store the currently selected tab in the hash value
    $("#menu-standalone a, .navbar-header a, .configuration a, a.move_tab").on("shown.bs.tab", function (e) {
        var hash = $(e.target).attr("href").substr(1);
        console.log('hash = ' + hash);
        window.location.hash = hash;
        if ($(e.target).attr("id") == 'home_link') // Si on click sur le lien "Accueil" en haut à gauche, les liens dans le menu reste actifs
        {
            $('#menu-standalone > ul li.active').removeClass('active');
        }
    });

    // on load of the page: switch to the currently selected tab

    var hash = window.location.hash;
    if (hash != '#synchronize-page' && hash.indexOf('-card') === -1 && hash.indexOf('-edit') === -1 && $('a[href="' + hash + '"]:not(.last_item, .create_item):first-child').length > 0)
    {
        $('a[href="' + hash + '"]:first-child').click();
    } else
    {
        window.location.hash = '#home';
        $('a[href="#home"]:first-child').click();
    }


    // Fermeture automatique du menu burger /!\ ne pas déplacer cette définition audessus du hash.click
    $('#menu-standalone .dropdown-menu > li > a').on('click', function () {
        if ($('.navbar-toggle').css('display') != 'none')
            $('.navbar-toggle').click();
    });


}

function showMessage(title, message, type, callback)
{
    var TType = {
        'default': BootstrapDialog.TYPE_DEFAULT
        , 'info': BootstrapDialog.TYPE_INFO
        , 'primary': BootstrapDialog.TYPE_PRIMARY
        , 'success': BootstrapDialog.TYPE_SUCCESS
        , 'warning': BootstrapDialog.TYPE_WARNING
        , 'danger': BootstrapDialog.TYPE_DANGER
    };

    var options = {
        title: title
        , message: message
        , type: TType[type]
    };

    if (typeof callback == 'undefined')
        BootstrapDialog.show(options);
    else {
        options.callback = callback;
        options.btnCancelClass = 'btn-default pull-left';
        options.btnOKClass = 'btn-danger';
        BootstrapDialog.confirm(options);
    }
}

function clearDatabase()
{
    showMessage('Clear database', 'Are you sure to want clear database?', 'danger', confirmClearDatabase);
}

function confirmClearDatabase(response)
{
    if (response === true)
        doliDb.dropDatabase();
}

function saveConfig() {

    localStorage.domain = $('#domain').val();
    localStorage.interface_url = $('#interface_url').val();
    localStorage.dolibarr_login = $('#dolibarr_login').val();
    localStorage.dolibarr_password = $('#dolibarr_password').val();

    $.ajax({
        url: localStorage.interface_url

        , data: {
            get: 'check'
            , jsonp: 1
            , login: localStorage.dolibarr_login
            , passwd: localStorage.dolibarr_password
            , entity: 1
        }
        , dataType: 'jsonp'
        , timeout: 5000 // Le test côté PHP pour vérifier que le login/mdp/entity correspond bien à un utilisateur prend 1sec, pour entrer la fonction d'erreur je suis obligé de définir un timeout (cas où l'url de l'interface est fausse)
        , success: function (res) {
            console.log(res);
            if (res == 'ok')
                showMessage('Confirmation', 'Configuration saved and connection is right !', 'success');
            else
                showMessage('Connection error', 'Configuration saved... But can\'t connect to Dolibarr', 'warning');
        }
        , error: function () {
            showMessage('Warning', 'Configuration saved... But i think it\'s wrong.', 'warning');
        }
    });
}

function synchronize(set_one_finish)
{
    if (set_one_finish !== true)
    {
        // Envoi des données local qui ont étaient modifiés
        $('#synchronize-page .sync-info').html('');

        var TDataToSend = [
            {type: 'product', container: '#synchronize-page .sync-info', msg_start: 'Sending products...', msg_end: 'Done'}
            , {type: 'thirdparty', container: '#synchronize-page .sync-info', msg_start: 'Sending thirdparties...', msg_end: 'Done'}
            , {type: 'proposal', container: '#synchronize-page .sync-info', msg_start: 'Sending proposals...', msg_end: 'Done'}
            //, {type: 'contact', container: '#synchronize-page .sync-info', msg_start: 'Sending contact...', msg_end: 'Done'}
        ];

        // le callback synchronize sera appelé avec un paramètre à true pour passer dans le "else" (récupération des données)
        sendData(TDataToSend);
    } else
    {
        // Récupération des données depuis Dolibarr
        var TObjToSync = [
            {type: 'product', container: '#synchronize-page .sync-info', msg_start: 'Fetching products...', msg_end: 'Done'}
            , {type: 'thirdparty', container: '#synchronize-page .sync-info', msg_start: 'Fetching thirdparties...', msg_end: 'Done'}
            , {type: 'proposal', container: '#synchronize-page .sync-info', msg_start: 'Fetching proposals...', msg_end: 'Done'}
            //, {type: 'contact', container: '#synchronize-page .sync-info', msg_start: 'Fetching contact...', msg_end: 'Done'}
        ];

        getData(TObjToSync);
    }
}

function sendData(TDataToSend)
{
    if (TDataToSend.length > 0)
    {
        /*
         * TODO ugly => on devrais avoir un appel du genre doliDb->getAllItemByIndex(storename, index, callback)
         * exemple : doliDb->getAllItemByIndex('product', 'update_by_indexedDB', sendToDomain)
         */
        
        console.log("HIHO senddata");
        console.log(TDataToSend);
       doliDb.sendAllUpdatedInLocal(TDataToSend);
    } else
    {
        synchronize(true);
    }
}

function getData(TObjToSync)
{
    if (TObjToSync.length > 0)
    {
        switch (TObjToSync[0].type) {
            case 'product':
                var date_last_sync = localStorage.date_last_sync_product || 0;
                break;
            case 'thirdparty':
                var date_last_sync = localStorage.date_last_sync_thirdparty || 0;
                break;
            case 'proposal':
                var date_last_sync = localStorage.date_last_sync_proposal || 0;
                break;
        }

        $(TObjToSync[0].container).append('<blockquote><span class="text-info">' + TObjToSync[0].msg_start + '</span></blockquote>'); // show info : start fetching

        $.ajax({
            url: localStorage.interface_url
            , dataType: 'jsonp'
            , data: {
                get: TObjToSync[0].type
                , jsonp: 1
                , date_last_sync: date_last_sync
                , login: localStorage.dolibarr_login
                , passwd: localStorage.dolibarr_password
                , entity: 1
            }
            , success: function (data) {

                _update_date_sync(TObjToSync[0].type, $.now());

                doliDb.updateAllItem(TObjToSync[0].type, data);

                $(TObjToSync[0].container + ' blockquote:last-child').append('<small class="text-info">' + TObjToSync[0].msg_end + '</small>'); // show info : done

                TObjToSync.splice(0, 1);
                getData(TObjToSync); // next sync
            }
            , error: function (xhr, ajaxOptions, thrownError) {
                // TODO téchniquement on tombera jamais dans le error car pas de timeout défini, sauf qu'on peux pas le définir sinon on risque d'interrompre la récupération des données
                showMessage('Synchronization error', 'Sorry, we met an error pending synchronization', 'danger');
                 $(TObjToSync[0].container).append('<blockquote><span class="text-error" style="color:red">Error sync with "' + TObjToSync[0].type + '"</span></blockquote>');
            }
        });
    } else
    {
        $('#synchronize-page .sync-info').append('<blockquote><p class="text-success">Sync terminated, everything is good !</p></blockquote>');
    }

}

function _update_date_sync(type, date)
{
    switch (type) {
        case 'product':
            localStorage.date_last_sync_product = date;
            break;
        case 'thirdparty':
            localStorage.date_last_sync_thirdparty = date;
            break;
        case 'proposal':
            localStorage.date_last_sync_proposal = date;
            break;
        case 'contact':
            localStorage.date_last_sync_contact = date;
            break;
    }
}

function takePicture() {
    navigator.camera.getPicture(function (fileURI) {

        window.resolveLocalFileSystemURI(fileURI,
                function (fileEntry) {
                    showMessage('Information', 'Got image file entry:' + fileEntry.fullPath, 'info');
                },
                function () {//error
                }
        );

    }, function () {
        // handle errors
    }, {
        destinationType: window.Camera.DestinationType.FILE_URI,
        sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: window.Camera.MediaType.ALLMEDIA
    });
}



function addEventListenerOnItemLink()
{
    $('li.list-group-item a, .doc_associate > ul > li > ul a').unbind('shown.bs.tab').bind('shown.bs.tab', function (e) {
        var hash = $(e.target).attr("href").substr(1);
        console.log('hash = ' + hash);
        window.location.hash = hash;
        $('#menu-standalone > ul li.active, .doc_associate > ul li').removeClass('active');
    });
}

/*
 * call the function getItem en indexdb.js
 * @param {type} type
 * @param {type} id
 * @param {type} callback
 * @param {type} args
 * @returns {undefined}
 */
function showItem(type, id, callback, args)
{   
    if (typeof callback != 'undefined')
    {
        if(type=='contact') {
            doliDb.getItem('thirdparty', args.fk_thirdparty, callback, args);
        }
        else {
            doliDb.getItem(type, id, callback, args);
        }
        
    } else
    {
        console.log('Callback non défini');
        showMessage('Information', 'The item display is not implemented yet', 'info');
    }
}
/*
function findContact(id, callback)
{
<<<<<<< HEAD

    console.log('showItem',type, id, callback, args);

=======
    
    var id_soc = $('#thirdparty-card input[name=id]').val();
    
    console.log('showItem',id_soc, callback);
    
>>>>>>> c13db88d4a4207b7f441fd7c6e6983039caff770
    if (typeof callback != 'undefined')
    {
        var thirdPart = doliDb.getItem('thirdparty', id_soc, callback);
        console.log('findContact', thirdPart);
        doliDb.getContact(id, thirdPart, callback);
    } else
    {
        showMessage('Information', 'The item display is not implemented yet', 'info');
    }
}
*/

/*
 *
 * @param {type} item
 * @returns {undefined}
 */
function getOneItem(type, id,id_dolibarr, callback) {


        $.ajax({
            url: localStorage.interface_url
            , dataType: 'jsonp'
            , data: {
                get: type
                ,id:id_dolibarr
                , jsonp: 1
                , date_last_sync: 0
                , login: localStorage.dolibarr_login
                , passwd: localStorage.dolibarr_password
                , entity: 1
            }
            , success: function (data) {
                console.log('getOnItem : ', type, id, id_dolibarr, data);
                doliDb.updateItem(type,id,data,callback);

                /*_update_date_sync(TObjToSync[0].type, $.now());

                doliDb.updateAllItem(TObjToSync[0].type, data);

                $(TObjToSync[0].container + ' blockquote:last-child').append('<small class="text-info">' + TObjToSync[0].msg_end + '</small>'); // show info : done

                TObjToSync.splice(0, 1);
                getData(TObjToSync); // next sync*/
            }
            , error: function (xhr, ajaxOptions, thrownError) {

                    window.alert('Dommage, vous êtes pas connecté');

            }
        });


}


/*
 * call the function getAllItem en indexdb.js
 * @param {type} type
 * @param {type} callback
 * @param {type} container
 * @returns {undefined}
 */
function showList(type, callback, container)
{
    if (typeof callback != 'undefined')
    {
        console.log("div.active");
        if($("div.active").attr('id') == 'proposal-card-edit' || $("div.active").attr('id') == 'proposal-card-add') {
            $("div.active").addClass('lastaction');
        }
        doliDb.getAllItem(type, callback, container);
    } else
    {
        showMessage('Information', 'The list display is not implemented yet', 'info');
        console.log('Callback non défini');
    }
}

/*
 * function which modify children value with differents id
 * @param {type} $container
 * @param {type} item
 * @returns {undefined}
 */
function setItemInHTML($container, item)
{
    $container.children('input[name=id]').val(item.id);
    $container.children('input[name=id_dolibarr]').val(item.id_dolibarr);
    for (var x in item)
    {
        value = item[x];
        if(x){
        $container.find('[rel=' + x + ']').each(function(i,item) {

            $item = $(item);

            if($item.attr('type')) {
                $item.val(value);
            }
            else{
                $item.html(value);

            }

        });}
    else{console.log("nan",x);}


    }
}


//-------Item Function----------

/*
 * apelle la fonction createItem de indexdb pour créer un nouvel item
 * dans le cas d'un contact on va juste l'ajouter au tableau tContact d'un thirdparty
 * @argument {jquery} $container | l'endroit on sera affiché l'item créer
 * @argument {string} type | type de l'élèment
 */
function createItem($container, type) {
    console.log('container', $container);
    var id = $container.children('input[name=id]').val();
    var $TInput = $container.find('form').find('input, textarea, select');
    var TValue = {};
    $TInput.each(function(i,input) {
        $input = $(input);

        TValue[$input.attr('name')] = $input.val();

    });
 
    if($("div.active").attr('id') == 'proposal-card-add'){
     
        if(TValue['ref'].length == 0){
            showMessage('Warning', 'Can\'t create a proposal without ref', 'warning');
            type = null;
        }
      var $Tr = $container.find('form').find('tr');
      TValue['statut_libelle']="Brouillon";
      TValue['statut']=0;
      TValue['lines'] =[];
          $Tr.each(function(i,input){
              $input =$(input);
              if($input.children('td[name="libelle"]').text().length != 0){
                  console.log("ONPASSEDANSLE LIBELLE");
                TValue['lines'][i] = {};
                TValue['lines'][i].ref=$input.children('td[name="libelle"]').text();
                TValue['lines'][i].subprice=$input.children('td[name="price"]').text();
                TValue['lines'][i].qty=$input.children('td[name="qty"]').children().val();
                TValue['lines'][i].tva_tx=$input.children('td[name="tva_tx"]').text();
                TValue['lines'][i].remise_percent=$input.children('td[name="remise_percent"]').children().val();
            }
          });
    }

    switch (type) {
        case 'product':
            var callback = showProduct;
            doliDb.createItem(type, TValue, callback);
            resetForm();

            break;
        case 'thirdparty':
            var callback = showThirdparty;
            resetForm();
            doliDb.createItem(type, TValue, callback);
            

            break;
        case 'proposal':
            var callback = showProposal;
            

            doliDb.createItem(type, TValue, callback);
            resetForm();
            break;
        case 'contact' :
            var fk_soc = $('#thirdparty-card input[name=id]').val();
            doliDb.getItem('thirdparty',fk_soc, addContact, TValue);
            resetForm();

            break;
    }

    propalProductList = [];

}


function resetForm() {
    // clearing inputs
    form = $(".active .container-fluid").find('form');
    var inputs = form.find('input');

    for (var i = 0; i<inputs.length; i++) {
        switch (inputs[i].type) {
            // case 'hidden':
            case 'text':
                inputs[i].value = '';
                break;
            case 'radio':
            case 'checkbox':
                inputs[i].checked = false;   
        }
    }

    // clearing selects
    var selects = form.find('select');
    for (var i = 0; i<selects.length; i++)
        selects[i].selectedIndex = 0;

    // clearing textarea
    var text= form.find('textarea');
    for (var i = 0; i<text.length; i++)
        text[i].value= '';
    
    $(".active .container-fluid").find('tr[name=line]').remove();

    return false;
}
/*
 * ajoute un contact au tcontact d'un thirdparty
 * @argument {json} item | l'endroit on sera affiché l'item créer
 * @argument {json} contact | type de l'élèment
 */
function addContact(item, contact) {
    console.log('addContact', item, contact);
    item.TContact.push(contact);
    console.log("id",item.id);
    doliDb.updateItem('thirdparty', item.id, item);
    showItem('thirdparty', item.id , showThirdparty)
}

/*
 * apelle la fonction updateitem de indexdb et les fonction de callback different selon le type
 * @argument {jquery} $container | l'endroit on sera affiché l'item créer
 * @argument {string} type | type de l'élèment
 */
function updateItem($container, type)
{
    console.log('container', $container);
    var id = $container.children('input[name=id]').val();
    var $TInput = $container.find('form').find('input, textarea, select');
    var TValue = {};
    $TInput.each(function(i,input) {
        $input = $(input);

        TValue[$input.attr('name')] = $input.val();

    });
    if($("div.active").attr('id') == 'proposal-card-edit'){
     
        if(TValue['ref'].length == 0){
            showMessage('Warning', 'Can\'t create a proposal without ref', 'warning');
            type = null;
        }
      var $Tr = $container.find('form').find('tr');
      
      TValue['lines'] =[];
          $Tr.each(function(i,input){
              $input =$(input);
              if($input.children('td[name="libelle"]').text().length != 0){
                  console.log("ONPASSEDANSLE LIBELLE");
                TValue['lines'][i-1] = {};
                TValue['lines'][i-1].ref=$input.children('td[name="libelle"]').text();
                TValue['lines'][i-1].subprice=$input.children('td[name="price"]').text();
                TValue['lines'][i-1].qty=$input.children('td[name="qty"]').children().val();
                TValue['lines'][i-1].tva_tx=$input.children('td[name="tva_tx"]').text();
                TValue['lines'][i-1].remise_percent=$input.children('td[name="remise_percent"]').children().val();
            }
          });
    }
    
    


    switch (type) {
        case 'product':
            var callback = showProduct;
            break;
        case 'thirdparty':
            var callback = showThirdparty;
            break;
        case 'proposal':
            var callback = showProposal;
            break;
        case 'contact' : //on ne passe probablement jamais dans ce cas la
            var callback = showContact;
            break;
    }

    doliDb.updateItem(type, id, TValue, callback);
    propalProductList = [];
}



function validateItem(type,$container,showProposal)
{
    var TValue = {};
    var id = $container.children('input[name=id]').val();

    if($("div.active").attr('id') == 'proposal-card'){
     
        if(TValue['ref'].length == 0){
            showMessage('Warning', 'Can\'t create a proposal without ref', 'warning');
            type = null;
        }
      var $Tr = $container.find('tbody').find('tr');
      TValue['statut_libelle']="Ouvert";
      TValue['statut']=1;
      TValue['lines'] =[];
          $Tr.each(function(i,input){
              $input =$(input);
              if($input.children('td[name="libelle"]').text().length != 0){
                  console.log("ONPASSEDANSLE LIBELLE");
                TValue['lines'][i-1] = {};
                TValue['lines'][i-1].ref=$input.children('td[name="libelle"]').text();
                TValue['lines'][i-1].subprice=$input.children('td[name="price"]').text();
                TValue['lines'][i-1].qty=$input.children('td[name="qty"]').text();
                TValue['lines'][i-1].tva_tx=$input.children('td[name="tva_tx"]').text();
                TValue['lines'][i-1].remise_percent=$input.children('td[name="remise"]').text();
            }
          });
    }
    
    


    switch (type) {
        case 'product':
            var callback = showProduct;
            break;
        case 'thirdparty':
            var callback = showThirdparty;
            break;
        case 'proposal':
            var callback = showProposal;
            break;
        case 'contact' : //on ne passe probablement jamais dans ce cas la
            var callback = showContact;
            break;
    }

    doliDb.updateItem(type, id, TValue, callback);
    propalProductList = [];
}


/*
 * créer un contact et l'ajoute et l'ajoute au sous menu du thirdparty
 */
function createContact()
{
    
    doliDb.createContact($('#thirdparty-card').children('input[name=id]').val(), $('#thirdparty-card').children('input[name=id_dolibarr]').val());
}

/*
 * apelle la fonction updateitem de indexdb et les fonction de callback different selon le type
 * @argument {jquery} $container | l'endroit on sera affiché l'item créer
 * @argument {string} type | type de l'élèment
 */
function createProposal()
{
   $('#proposal-card-add #nom_client').children('input[name=nom-client]').val($('#thirdparty-card h1[rel=name]').html());
    doliDb.createProposal($('#thirdparty-card').children('input[name=id]').val(), $('#thirdparty-card').children('input[name=id_dolibarr]').val());
}

function addLine(){
	/*
	 *TODO au clic sur un <li> de la propal, on ajoute la ligne comme proposal_line.
	 * On crée un tableau propal_lignes auquel on ajoute la ligne
	 * On ajoute ensuite chaque ligne au <ul> sur la fiche d'édition de propale
	*/
  }
//----------My Function--------


function addItemToList(ThisElement) {
    console.log(ThisElement);
    if($("div.lastaction").attr('id')=="proposal-card-add"){
        currentPropal=$("#proposal-card-add");
        var elem = ThisElement.parentNode.getAttribute("label").split(';');
        console.log('ADD ITEM TO LIST'+elem);
        propalProductList.push({'libelle':elem[0],'prix':elem[1],'tva_tx':elem[2], 'quantite':1});
        console.log("libelle IS "+propalProductList);
        majTableau("add");
        currentPropal.removeClass('lastaction');
    }
    else{
        currentPropal=$("#proposal-card-edit");
        var elem = ThisElement.parentNode.getAttribute("label").split(';');
        console.log('ADD ITEM TO LIST'+elem);
        propalProductList.push({'libelle':elem[0],'prix':elem[1],'tva_tx':elem[2], 'quantite':1});
        console.log("libelle IS "+propalProductList);
        majTableau("edit");
        currentPropal.removeClass('lastaction');
    }
    $("#product-list-propal").attr('class','tab-pane');
    currentPropal.attr('class','tab-pane active');
}

function toggleSelect(object) {
    $li = $(object).closest('li');
    console.log('toggleSelect',$li);
    if (!$li.hasClass('checked'))
    {
        $li.addClass('checked');
    } else
    {
        $li.removeClass('checked');
    }

}

function addItemToPropal(object) {
    StringList=''
    $li = $(object).closest('li');
    var product = {};

    product.name=$li.attr('label');
    product.description='';
    product.prixU=10;
    console.log(product);
}

/**
 * Fonction de communication crossdomain
 */
function ReceiveMessage(evt)
{
    var message;
    //localStorage.domain
    console.log("a",evt);
    if (evt.origin != localStorage.domain) {
        console.log('Crossdomain denied');
        showMessage('Accès non restreint', 'Nom de domain non autorisé, vérifiez votre configuration.', 'warning');
    } else {
        console.log('Requete de : ', evt.origin);
        console.log('Date returned : ', evt.data);
        console.log(evt);
    }

    //evt.source.postMessage("thanks, got it ;)", event.origin);
}

if (window.addEventListener)
{

    //alert("standards-compliant");
    // For standards-compliant web browsers (ie9+)
    window.addEventListener("message", ReceiveMessage, false);
} else
{
    console.log(window);
    //alert("not standards-compliant (ie8)");
    window.attachEvent("onmessage", ReceiveMessage);
}


function editContact(item)
{
    var $container = $('#contact-card-edit');
    $container.children('input[name=id]').val(item.id_dolibarr);
    console.log(item);
    for (var x in item)
    {
        $container.find('[name=' + x + ']').val(item[x]);
    }
}

function dropItem(storename, id, callback)
{
    doliDb.dropItem(storename, id, callback);
}
