/* Pseudo class DB */
var DoliDb = function () {};

            

    DoliDb.prototype.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    DoliDb.prototype.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    DoliDb.prototype.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    DoliDb.prototype.db = {};
    DoliDb.prototype.dbName = 'dolibarr';

    DoliDb.prototype.open = function (callback) {
     
        if (!this.indexedDB) {
            //showMessage('Warning', 'Votre navigateur ne supporte pas une version stable d\'IndexedDB', 'warning');
            return;
        }

        var version = 16;
        var request = this.indexedDB.open(this.dbName, version); // Attention la version ne peut pas être inférieur à la dernière version

        request.onupgradeneeded = function (event) { // cette fonction doit normalement mettre à jour le schéma BDD sans qu'on soit obligé de modifier le numéro de version 
            DoliDb.prototype.db = event.currentTarget.result;

            try {
                DoliDb.prototype.db.deleteObjectStore("product");
            } catch (e) {
                console.log(e);
            }

            try {
                DoliDb.prototype.db.deleteObjectStore("thirdparty");
            } catch (e) { 
                console.log(e);
            }

            try {
                DoliDb.prototype.db.deleteObjectStore("proposal");
            } catch (e) {
                console.log(e);
            }
            
            try {
                DoliDb.prototype.db.deleteObjectStore("contact");
            } catch (e) {
                console.log(e);
            }

            var objectStore = DoliDb.prototype.db.createObjectStore("product", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("id", "id", {unique: true});
            objectStore.createIndex("id_dolibarr", "id_dolibarr", {unique: false});
            objectStore.createIndex("label", "label", {unique: false});
            // a rajouter (voir createItem() ? : objectStore.createIndex("create_by_indexedDB", "create_by_indexedDB", {unique: false});
            objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", {unique: false}); // INDEX OBLIGATOIRE POUR TOUS LES OBJETS

            var objectStore = DoliDb.prototype.db.createObjectStore("thirdparty", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("id", "id", {unique: true});
            objectStore.createIndex("id_dolibarr", "id_dolibarr", {unique: false});
            objectStore.createIndex("name", "keyname", {unique: false});
            objectStore.createIndex("create_by_indexedDB", "create_by_indexedDB", {unique: false});
            objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", {unique: false});
            
            // faudrait drop l'entite contact vu qu'on utilise maintenant les contacts liée a un thirdPart
            /*var objectStore = DoliDb.prototype.db.createObjectStore("contact", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("id", "id", {unique: true});
            objectStore.createIndex("id_dolibarr", "id_dolibarr", {unique: false});
            objectStore.createIndex("fk_thirdparty", "fk_thirdparty", {unique: false});
            objectStore.createIndex("name", "keyname", {unique: false});
            objectStore.createIndex("create_by_indexedDB", "create_by_indexedDB", {unique: false});
            objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", {unique: false});*/

            var objectStore = DoliDb.prototype.db.createObjectStore("actioncomm", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("id", "id", {unique: true});
            objectStore.createIndex("id_dolibarr", "id_dolibarr", {unique: false});
            objectStore.createIndex("socid", "socid", {unique: false});
            objectStore.createIndex("fk_project", "fk_project", {unique: false});
            objectStore.createIndex("contactid", "contactid", {unique: false});
            objectStore.createIndex("create_by_indexedDB", "create_by_indexedDB", {unique: false});
            objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", {unique: false});

            var objectStore = DoliDb.prototype.db.createObjectStore("proposal", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("id", "id", {unique: true});
            objectStore.createIndex("id_dolibarr", "id_dolibarr", {unique: false});
            objectStore.createIndex("ref", "ref", {unique: true});//lines tableau 
            objectStore.createIndex("socid", "socid", {unique: false});
            objectStore.createIndex("cond_reglement", "cond_reglement", {unique: false});
            objectStore.createIndex("mode_reglement", "mode_reglement", {unique: false});
            objectStore.createIndex("create_by_indexedDB", "create_by_indexedDB", {unique: false});
            objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", {unique: false});

            var objectStore = DoliDb.prototype.db.createObjectStore("proposal_line", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("id", "id", {unique: true});
            objectStore.createIndex("id_dolibarr", "id_dolibarr", {unique: false});
            objectStore.createIndex("fk_propal", "fk_propal", {unique: false});
            objectStore.createIndex("create_by_indexedDB", "create_by_indexedDB", {unique: false});
            objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", {unique: false});
        };

        request.onsuccess = function (event) {
            DoliDb.prototype.db = event.target.result;
            console.log("open db success",DoliDb.prototype.db);
            
            if(typeof callback != "undefined") {
               callback();
           }

        };

        request.onerror = function () {
            console.log("open db error");
            showMessage('Error', 'Can\'t open database, an error has occured', 'danger');
        };
        request.onblocked = function () {
            console.log("open db blocked");
            showMessage('Error', 'Database locked', 'danger');
        };

           
    };
   

    DoliDb.prototype.createItem = function (storename, item, callback) {  
        
        var transaction = this.db.transaction(storename, "readwrite");
        var objectStore = transaction.objectStore(storename);
        item.id_dolibarr = 0;
        item.create_by_indexedDB = 1;
        item.update_by_indexedDB = 1;
        console.log('passe dans le createItem d\'indexdb.js');
        console.log(item);
        switch(storename)
        {
            case 'contact' : 
                item.fk_thirdparty = fk_thirdparty;
                break;
            case 'proposal' : 
                item.socid = fk_thirdparty;
                break;
        }
        res=objectStore.add(item);
        console.log("res");
        console.log(res);
        //res.onsuccess = fonction (event) {
        //else{
        showMessage('Create', 'The current record has been created', 'success');    
        if (typeof callback != 'undefined') {
            callback(item);
        }
        else {
            return item;               
        }
    };

    DoliDb.prototype.dropItem = function (storename, id, callback) {
        console.log('dropItem:id',id);
        var transaction = this.db.transaction(storename, "readwrite");
        var store = transaction.objectStore(storename);
        
        var res = store.delete(id);
      
        res.onsuccess = function (e) {
            console.log('Delete', 'The current record has been deleted', 'success');
            showMessage('Delete', 'The current record has been deleted', 'success');
        };
     
};
 


    DoliDb.prototype.getAllItem = function (type, callback, arg1) {
        var TItem = new Array;

        var transaction = this.db.transaction([type], "readonly");
        var objectStore = transaction.objectStore(type);

        // Get everything in the store;
        var keyRange = this.IDBKeyRange.lowerBound(0);
        var cursorRequest = objectStore.openCursor(keyRange);

        cursorRequest.onsuccess = function (event) {
            var result = event.target.result;
            if (result)
            {
                TItem.push(result.value);
                result.continue();
            } else
            {
                if (typeof callback !== 'undefined')
                    callback(TItem, arg1);
                return false; // de toute manière c'est de l'asynchrone, donc ça sert à rien de return TItem
            }
        };

        cursorRequest.oncomplete = function () {};

        cursorRequest.onerror = DoliDb.prototype.db.onerror;
    };


    DoliDb.prototype.getItem = function (storename, id, callback, args) {
        var transaction = this.db.transaction(storename, "readonly");
        var objectStore = transaction.objectStore(storename);
        
        id = parseInt(id);
        var request = objectStore.get(id);
        //pour les contacts liée à un thirdparty l'id est good mais on arrive pas a selectionne l'item
        request.onsuccess = function (event)
        {
            console.log("args dans le getItem", args);
            var item = event.target.result;
              console.log(item);
            if (item)
            {
                if (storename == 'thirdparty' || storename == 'proposal')
                {   
                    
                    DoliDb.prototype.getChildren(storename, item, false, callback, args);
                } else
                {
                    if (typeof callback != 'undefined')
                        callback(item, args);
                    else
                        console.log("getItem -> default");
                        return item;
                }
            } else {
                showMessage('Warning', 'Item not found', 'warning');
            }
        };

    };
    
    
    /*DoliDb.prototype.getContact = function (id, thirdParty, callback)
    {
        //console.log('getContact', thirdParty.TContact[id]);
        //return thirdParty.TContact[id];
    }*/

    DoliDb.prototype.getChildren = function (storename, parent, TChild, callback, args) {
        if (TChild === false)
        {
            switch (storename) {
                case 'thirdparty':
                    var TChild = [
                         {storename: 'proposal', key_test: 'socid', array_to_push: 'TProposal'}
                        //,{storename: 'contact', key_test: 'fk_thirdparty', array_to_push: 'TContact'}
                        //,{storename: 'order', key_test: 'fk_thirdparty', array_to_push: 'TOrder'}
                        //,{storename: 'bill', key_test: 'fk_thirdparty', array_to_push: 'TBill'}
                       
                    ];

                    break;
                case 'proposal':
                    var TChild = [
                        {storename: 'proposal_line', key_test: 'fk_propal', array_to_push: 'TLine'}
                    ];

                    break;
            }
        }

        if (TChild.length > 0)
            this.setChild(storename, parent, TChild, callback, args);
        else
            callback(parent, args);
    };

    DoliDb.prototype.setChild = function (storename, parent, TChild, callback, args) {

        parent[TChild[0].array_to_push] = new Array;
        
        var transaction = this.db.transaction([TChild[0].storename], "readonly");
        var objectStore = transaction.objectStore(TChild[0].storename);
        var index = objectStore.index(TChild[0].key_test);

        var cursorRequest = index.openCursor(this.IDBKeyRange.only(parent.id_dolibarr));


        cursorRequest.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor)
            {
                parent[TChild[0].array_to_push].push(cursor.value);
                cursor.continue();
            } else
            {
                TChild.splice(0, 1);
                DoliDb.prototype.getChildren(storename, parent, TChild, callback, args);
            }
        };
    };
var fk_thirdparty;

    DoliDb.prototype.createProposal = function (id_object, fk_soc) {

        if (typeof fk_soc == 'undefined' || !fk_soc) {
            showMessage('Warning', 'Can\'t create a proposal without thirdparty id', 'warning');
            return;
        }
        /*
        var obj = {
            ref: '(PROV' + ($.now()) + ')'
            , socid: fk_soc
            , id_dolibarr: 0
            , name: ''
            , create_by_indexedDB: 1
            , update_by_indexedDB: 0
        };
        var transaction = this.db.transaction('proposal', "readwrite");
        transaction.oncomplete = function (event) {
            console.log('Transaction completed: database modification finished.', event);
        };
        transaction.onerror = function (event) {
            console.log('Transaction not opened due to error. Duplicate items not allowed.', event);
        };

        var objectStore = transaction.objectStore('proposal');

        var add_request = objectStore.add(obj);
        
        add_request.onsuccess = function (event) {
            var id = event.target.result;
            console.log('id generated = ', id);
            showItem('proposal', id, showProposal, {container: $('#proposal-card-add')});
        };

        add_request.onerror = function (event) {
            console.log('event',event);
            showMessage('Error', event.target.error.name + ' : ' + event.target.error.message, 'danger');
        };*/
        fk_thirdparty = fk_soc;
    };

    

    DoliDb.prototype.createContact = function (fk_soc) {
        if (typeof fk_soc == 'undefined' || !fk_soc) {
            showMessage('Warning', 'Can\'t create a contact without thirdparty id', 'warning');
            return;
        }
        
        fk_thirdparty = fk_soc;
    };



    DoliDb.prototype.updateItem = function (storename, id, TValue, callback) {
        
        var transaction = this.db.transaction(storename, "readwrite");
        var objectStore = transaction.objectStore(storename);

        id = parseInt(id);
        var request = objectStore.get(id);
        console.log('requete', request);
        request.onsuccess = function (event)
        {
            var item = event.target.result;
            console.log("item dans le update", item);
            item.update_by_indexedDB = 1;

            if (item)
            {
                $.extend(true, item, TValue);
                if(storename == 'proposal'){
                    if(item['lines'].length != TValue['lines'].length){
                        item['lines'] = [];
                        TValue['lines'].forEach(function(line){
                            item['lines'].push(line);
                        });
                        
                    }
                }
                
                item.update_by_indexedDB = 1;

                console.log('beforeput', item);
                objectStore.put(item);
                
                showMessage('Update', 'The current record has been updated', 'success');
                if (typeof callback != 'undefined')
                    callback(item);
                else
                    return item;
            } else
            {
                showMessage('Warning', 'Item not found', 'warning');
            }
        };
    };


    // TODO à refondre : voir fonction sendData() dans app.js
    DoliDb.prototype.sendAllUpdatedInLocal = function (TDataToSend) {
	
        var storename = TDataToSend[0].type;
        var TItem = new Array;
        
        var transaction = this.db.transaction(storename, "readonly");
        var objectStore = transaction.objectStore(storename);
        var index = objectStore.index('update_by_indexedDB');
        // Get all records who updated in local (update_by_indexedDB == 1)
        var cursorRequest = index.openCursor(this.IDBKeyRange.only(1));
        cursorRequest.onsuccess = function (event) {
            var cursor = event.target.result;

            if (cursor)
            {
                TItem.push(cursor.value);
                cursor.continue();
            } else
            {
                $(TDataToSend[0].container).append('<blockquote><span class="text-info">' + TDataToSend[0].msg_start + '</span></blockquote>'); // show info : start fetching
                var data = {
                    put: storename
                    , jsonp: 1
                    , TItem: JSON.stringify(TItem)
                    , login: localStorage.dolibarr_login
                    , passwd: localStorage.dolibarr_password
                    , entity: 1
                };
                   console.log("TItem");
                   console.log(TItem);
                var $container = $('#form_to_send_data');
                $container.attr('action', localStorage.interface_url);
                $container.children('input[name=put]').val(storename);
                $container.children('input[name=login]').val(localStorage.dolibarr_login);
                $container.children('input[name=passwd]').val(localStorage.dolibarr_password);
                $container.children('input[name=entity]').val(1);
                $container.children('textarea[name=TItem]').val(JSON.stringify(TItem));
             
                $container.submit();

                //TODO voir pour récupérer le retour PHP 
                var success = true;

                if (success)
                {
                    $(TDataToSend[0].container + ' blockquote:last-child').append('<small class="text-info">' + TDataToSend[0].msg_end + ' (' + TItem.length + ')</small>'); // show info : done

                    TDataToSend.splice(0, 1);
                    setTimeout(function () {
                        sendData(TDataToSend); // next sync
                    }, 1500);
                } else
                {
                    showMessage('Synchronization error', 'Sorry, we meet an error pending synchronization', 'danger');
                    $(TDataToSend[0].container).append('<blockquote><span class="text-error" style="color:red">Error sync with "' + TDataToSend[0].type + '"</span></blockquote>');
                }

            }
        };
    };

    DoliDb.prototype.updateAllItem = function (storename, data) {

        var transaction = this.db.transaction(storename, "readwrite");
        var objectStore = transaction.objectStore(storename);

        // Get everything in the store;
        var keyRange = this.IDBKeyRange.lowerBound(0);
        var cursorRequest = objectStore.openCursor(keyRange);

        cursorRequest.onsuccess = function (event) {
            var result = event.target.result;

            if (result)
            {
                objectStore.delete(result.key);
                result.continue();
            } else
            {
                for (var i in data)
                {
                    data[i] = DoliDb.prototype.prepareItem(storename, data[i], 'add');
 
                    var add_request = objectStore.add(data[i]);
                    console.log('updateAllItem',data[i]);
                    add_request.onsuccess = function (event) {
                        var id = event.target.result;
                        var transaction = DoliDb.prototype.db.transaction(storename, "readwrite");
                        var objectStore = transaction.objectStore(storename);

                        var request = objectStore.get(id.toString());
                        request.onsuccess = function ()
                        {
                            var item = request.result;
                        
                            if (item)
                                item = DoliDb.prototype.postItem(storename, item);
                            // TODO le postItem est là pour ajouter des infos ou les modifier si nécessaire, à voir plus tard si on en a besoin
                            //objectStore.put(item);
                        };

                    };

                }
            }
        };

        cursorRequest.oncomplete = function () {};
        cursorRequest.onerror = DoliDb.prototype.indexedDB.onerror;
    };

    DoliDb.prototype.prepareItem = function (storename, item, action) {
        if (action == 'add')
        {
            item.id_dolibarr = item.id;
            delete(item.id);
        }

        switch (storename) {
            case 'product':
                break;
            case 'thirdparty':
                item.keyname = item.name.toLowerCase();
                break;
            case 'proposal':

                break;
        }

        return item;
    };

    DoliDb.prototype.postItem = function (storename, item) {
        switch (storename) {
            case 'proposal':
                this.addLines('proposal_line', 'fk_propal', item.id, item.lines);
                break;
            default:
                break;
        }

        return item;
    };

    DoliDb.prototype.addLines = function (storename, indexKey, indexValue, TLine) {
        var transaction = this.db.transaction(storename, "readwrite");
        var objectStore = transaction.objectStore(storename);
        var index = objectStore.index(indexKey);

        // Get all records who updated in local
        var cursorRequest = index.openCursor(this.IDBKeyRange.only(indexValue));

        cursorRequest.onsuccess = function (event) {
            var cursor = event.target.result;

            if (cursor)
            {
                objectStore.delete(cursor.key);
                cursor.continue();
            } else
            {
                for (var i = 0; i < TLine.length; i++)
                {
                    objectStore.put(TLine[i]);
                }
            }
        };
    };

    DoliDb.prototype.close = function () {
        this.db.close();
    };

    DoliDb.prototype.dropDatabase = function () {
    //    this.close();

        var request = this.indexedDB.deleteDatabase(this.dbName);
        request.onsuccess = function () {
            console.log("Deleted database successfully");
            showMessage('Confirmation', 'Deleted database successfully', 'success');
            DoliDb.prototype.open();
        };
        request.onerror = function () {
            console.log("Couldn't delete database");
            showMessage('Error', 'Can\'t delete database, an error has occured', 'danger');
        };
        request.onblocked = function () {
            console.log("Couldn't delete database due to the operation being blocked");
            showMessage('Error', 'Can\'t delete database, it is locked', 'danger');
        };

    };
    
    DoliDb.prototype.getItemOnKey = function (storename, keyword, TKey, callback, arg1) {
        keyword = keyword.toLowerCase();
        var TItem = new Array;

        var transaction = this.db.transaction(storename, "readonly");
        var objectStore = transaction.objectStore(storename);

        var cursorRequest = objectStore.openCursor();
        cursorRequest.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor)
            {
                for (var i in TKey) {
                  
                    if (cursor.value[TKey[i]].toString().toLowerCase().indexOf(keyword) !== -1) // search as "%keyword%"
                    {
                        TItem.push(cursor.value);
                        break;
                    }
                 
                }

                cursor.continue();
            } else
            {
                if (typeof callback !== 'undefined')
                    callback(TItem, arg1);
                return false; // de toute manière c'est de l'asynchrone, donc ça sert à rien de return TItem
            }
        };

    };
    DoliDb.prototype.setNomClient = function (storename, keyword, TKey, $container) {
        keyword = keyword.toLowerCase();
        var TItem = new Array;

        var transaction = this.db.transaction(storename, "readonly");
        var objectStore = transaction.objectStore(storename);

        var cursorRequest = objectStore.openCursor();
        cursorRequest.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor)
            {
                for (var i in TKey) {
                    
                    if (typeof cursor.value[TKey[i]] != 'undefined')
                    {
                        if (cursor.value[TKey[i]].toString().toLowerCase().indexOf(keyword) == 0) // search as "keyword"
                        {
                            TItem.push(cursor.value);
                            break;
                        }
                    } else
                    {
                        console.log('WARNING attribute [' + TKey[i] + '] not exists in object store [' + storename + ']', cursor.value);
                    }
                }

                cursor.continue();
            } else
            {
                $container.empty();
               var $li = $('<p>'+TItem[0].nom+'</p>');
              
                $container.append($li);
            }
        };

    };




/*
 
 dolibarr.indexedDB = {};
 
 dolibarr.indexedDB.open = function() {
 
 var version = 10;
 var request = indexedDB.open("dolibarr", version);
 
 request.onsuccess = function(e) {
 dolibarr.indexedDB.db = e.target.result;
 dolibarr.indexedDB.getAllProduct();
 dolibarr.indexedDB.getAllThirdparty();
 };
 
 request.onupgradeneeded = function (evt) { 
 var db = evt.currentTarget.result;
 
 try {
 db.deleteObjectStore("product");	
 }
 catch(e) {
 
 }
 
 try {
 db.deleteObjectStore("thirdparty");
 }
 catch(e) {
 
 }
 
 
 var objectStore = db.createObjectStore("product", 
 { keyPath: "id", autoIncrement: true });
 
 objectStore.createIndex("id", "id", { unique: true });
 objectStore.createIndex("label", "label", { unique: false });
 
 var objectStore = db.createObjectStore("thirdparty", 
 { keyPath: "id", autoIncrement: true });
 
 objectStore.createIndex("id", "id", { unique: true });
 objectStore.createIndex("name", "keyname", { unique: false });
 
 };
 
 request.onerror = dolibarr.indexedDB.onerror;
 
 };
 
 
 dolibarr.indexedDB.addProduct = function(item) {
 dolibarr.indexedDB.addItem('product',item,function(item) {
 TProduct.push(item);
 refreshproductList();
 });
 };
 dolibarr.indexedDB.addThirdparty = function(item) {
 item.keyname = item.name.toLowerCase();
 
 dolibarr.indexedDB.addItem('thirdparty',item,function(item) {
 TThirdParty.push(item);
 refreshthirdpartyList();
 });
 
 };
 
 dolibarr.indexedDB.getAll= function(storename, TArray, callback) {
 var trans = dolibarr.indexedDB.db.transaction(storename, IDBTransaction.READ_ONLY);
 var store = trans.objectStore(storename);
 
 TArray.splice(0,TArray.length);
 // Get everything in the store;
 var keyRange = IDBKeyRange.lowerBound(0);
 var cursorRequest = store.openCursor(keyRange);
 
 cursorRequest.onsuccess = function(e) {
 var result = e.target.result;
 if(result) {
 
 TArray.push(result.value);
 result.continue();
 
 }
 else{
 
 callback();
 }
 
 
 };
 
 cursorRequest.oncomplete = function() {
 
 
 };
 
 cursorRequest.onerror = dolibarr.indexedDB.onerror;
 };
 
 dolibarr.indexedDB.getNewId =function(storename) {
 return storename+'-'+Math.floor((1 + Math.random()) * 0x100000000)
 .toString(16)
 .substring(1)
 +'-'+Math.floor((1 + Math.random()) * 0x100000000)
 .toString(16)
 .substring(1);
 };
 
 dolibarr.indexedDB.addItem = function(storename,item, callbackfct) {
 var trans = dolibarr.indexedDB.db.transaction(storename, "readwrite");
 var store = trans.objectStore([storename]);
 store.delete(item.id);
 var request = store.put(item);
 
 trans.oncomplete = function(e) {
 callbackfct(item);
 };
 
 request.onerror = function(e) {
 console.log(e.value);
 };
 };
 
 dolibarr.indexedDB.deleteItem = function (storename, id, callbackfct) {
 var trans = dolibarr.indexedDB.db.transaction(storename, "readwrite");
 var store = trans.objectStore([storename]);
 store.delete(id);
 
 trans.onsuccess = function(e) {
 if(callbackfct) callbackfct();
 };
 
 
 };
 
 dolibarr.indexedDB.count = function(storename) {
 var db = dolibarr.indexedDB.db;
 
 var transaction = db.transaction([storename], "readonly");
 var objectStore = transaction.objectStore(storename);
 var cursor = objectStore.openCursor();  
 var count = objectStore.count();
 
 return count;
 };    
 dolibarr.indexedDB.getItemOnKey = function(storename, value, key, callbackfct) {
 var db = dolibarr.indexedDB.db;
 var trans = db.transaction(storename, "readwrite");
 var store = trans.objectStore(storename);
 
 var index = store.index(key);
 //var boundKeyRange = IDBKeyRange.bound("A","Z",true,true);
 //var boundKeyRange = IDBKeyRange.bound(value.toLowerCase(),value.toUpperCase()+"ZZZZZZZZZZZZZZZ",false, false);
 value = value.toLowerCase();
 var boundKeyRange = IDBKeyRange.bound(value,value+"zzzzzzzzzzz");
 
 index.openCursor(boundKeyRange).onsuccess = function(event) {
 console.log(event.target.result);
 
 var cursor = event.target.result;
 if (cursor) {
 callbackfct(cursor.value);
 
 // Do something with the matches.
 cursor.continue();
 }
 
 
 }; 
 
 };
 
 dolibarr.indexedDB.getItem = function (storename, id, callbackfct) {
 var db = dolibarr.indexedDB.db;
 var trans = db.transaction(storename, "readwrite");
 var store = trans.objectStore(storename);
 
 var request = store.get(id.toString()); 
 request.onsuccess = function() {
 var matching = request.result;
 if (matching !== undefined) {
 callbackfct(matching);
 } else {
 alert('Item not found');
 }
 };
 };
 
 dolibarr.indexedDB.getAllProduct = function() {
 
 var db = dolibarr.indexedDB.db;
 var trans = db.transaction(["product"], "readwrite");
 var store = trans.objectStore("product");
 
 // Get everything in the store;
 var keyRange = IDBKeyRange.lowerBound(0);
 var cursorRequest = store.openCursor(keyRange);
 
 cursorRequest.onsuccess = function(e) {
 var result = e.target.result;
 if(result) {
 TProduct.push(result.value);
 
 //renderTodo(result.value);
 result.continue();
 
 }
 else{
 
 refreshproductList();
 }
 
 
 };
 
 cursorRequest.oncomplete = function() {
 
 
 };
 
 cursorRequest.onerror = dolibarr.indexedDB.onerror;
 };
 
 
 dolibarr.indexedDB.getAllThirdparty = function() {
 
 var db = dolibarr.indexedDB.db;
 var trans = db.transaction(["thirdparty"], "readwrite");
 var store = trans.objectStore("thirdparty");
 
 // Get everything in the store;
 var keyRange = IDBKeyRange.lowerBound(0);
 var cursorRequest = store.openCursor(keyRange);
 
 cursorRequest.onsuccess = function(e) {
 var result = e.target.result;
 if(result) {
 TThirdParty.push(result.value);
 result.continue();
 
 }
 else{
 
 refreshthirdpartyList();
 }
 
 
 };
 
 cursorRequest.oncomplete = function() {
 
 
 };
 
 cursorRequest.onerror = dolibarr.indexedDB.onerror;
 };
 
 dolibarr.indexedDB.clear=function() {
 var db = dolibarr.indexedDB.db;
 db.close();
 
 var req = indexedDB.deleteDatabase("dolibarr");
 req.onsuccess = function () {
 console.log("Deleted database successfully");
 };
 req.onerror = function () {
 console.log("Couldn't delete database");
 };
 req.onblocked = function () {
 console.log("Couldn't delete database due to the operation being blocked");
 };
 */




