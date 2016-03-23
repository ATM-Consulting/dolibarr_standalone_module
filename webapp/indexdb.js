/* Pseudo class DB */
var DoliDb = function() {

	DoliDb.prototype.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	DoliDb.prototype.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	DoliDb.prototype.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
	
	DoliDb.prototype.db = {};
	DoliDb.prototype.dbName = 'dolibarr';
	
	DoliDb.prototype.open = function() {
		
		if (!this.indexedDB) {
			showMessage('Warning', 'Votre navigateur ne supporte pas une version stable d\'IndexedDB', 'warning');
			return;
		}
		
		var version = 13;
		var request = this.indexedDB.open(this.dbName, version); // Attention la version ne peut pas être inférieur à la dernière version
		
		request.onupgradeneeded = function (event) { // cette fonction doit normalement mettre à jour le schéma BDD sans qu'on soit obligé de modifier le numéro de version 
			DoliDb.prototype.db = event.currentTarget.result;
			   
			try { DoliDb.prototype.db.deleteObjectStore("product"); }
			catch(e) { console.log(e); }
			
			try { DoliDb.prototype.db.deleteObjectStore("thirdparty"); }
			catch(e) { console.log(e); }
			
			try { DoliDb.prototype.db.deleteObjectStore("proposal"); }
			catch(e) { console.log(e); }
			
			var objectStore = DoliDb.prototype.db.createObjectStore("product", { keyPath: "id", autoIncrement: true });
			objectStore.createIndex("id", "id", { unique: true });
			objectStore.createIndex("label", "label", { unique: false });
			objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", { unique: false }); // INDEX OBLIGATOIRE POUR TOUS LES OBJETS
			
			var objectStore = DoliDb.prototype.db.createObjectStore("thirdparty", { keyPath: "id", autoIncrement: true });
			objectStore.createIndex("id", "id", { unique: true });
			objectStore.createIndex("name", "keyname", { unique: false });
			objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", { unique: false });
			
			var objectStore = DoliDb.prototype.db.createObjectStore("proposal", { keyPath: "id", autoIncrement: true });
			objectStore.createIndex("id", "id", { unique: true });
			objectStore.createIndex("ref", "ref", { unique: true });
			objectStore.createIndex("update_by_indexedDB", "update_by_indexedDB", { unique: false });
		};
		
		request.onsuccess = function(event) {
			DoliDb.prototype.db = event.target.result;
			console.log("open db success");
		};
		
	    request.onerror = function() { 
	    	console.log("open db error");
	    	showMessage('Error', 'Can\'t open database, an error has occured', 'danger'); 
	    };
	    request.onblocked = function() { 
	    	console.log("open db blocked");
	    	showMessage('Error', 'Database locked', 'danger');
	    };
	    
	};
	
	DoliDb.prototype.getAllItem = function(type, callback) {
		console.log('getAllItem : '+type, callback);
		
		var TItem = new Array;
		
		var transaction = this.db.transaction([type], "readonly");
		var objectStore = transaction.objectStore(type);
		
		// Get everything in the store;
		var keyRange = this.IDBKeyRange.lowerBound(0);
		var cursorRequest = objectStore.openCursor(keyRange);
		
		cursorRequest.onsuccess = function(event) {
			var result = event.target.result;
			if(result) 
			{
				TItem.push(result.value);
				result.continue();
			}
			else
			{
				if (typeof callback !== 'undefined') callback(TItem);
				return false; // de toute manière c'est de l'asynchrone, donc ça sert à rien de return TItem
			}
		};
		
		cursorRequest.oncomplete = function() {};
		  
		cursorRequest.onerror = DoliDb.prototype.db.onerror;
	};
	
	
	DoliDb.prototype.getItem = function(storename, id, callback) {
		var transaction = this.db.transaction(storename, "readonly");
		var objectStore = transaction.objectStore(storename);
		  
		var request = objectStore.get(id.toString()); 
		request.onsuccess = function() 
		{
			var item = request.result;
			if (item !== 'undefined') 
			{
				if (storename == 'thirdparty')
				{
					DoliDb.prototype.getChildren(storename, item, callback);
				}
				else
				{
					if (typeof callback != 'undefined') callback(item);
					else return item;
				}
			} else {
				showMessage('Warning', 'Item not found', 'warning');
			}
		};
	};
	
	DoliDb.prototype.getChildren = function (storename, parent, callback, TChild) {
		switch (storename) {
			case 'thirdparty':
				if (typeof TChild == 'undefined')
				{
					var TChild = [
						{storename: 'proposal', key_test: 'socid', array_to_push: 'TProposal'}
						//,{storename: 'order', key_test: 'fk_soc', array_to_push: 'TOrder'}
						//,{storename: 'bill', key_test: 'fk_soc', array_to_push: 'TBill'}
					];
				}
				break;
		}
		
		if (TChild.length > 0) this.setChild(storename, parent, TChild, callback);
		else callback(parent);
	};
	
	DoliDb.prototype.setChild = function(storename, parent, TChild, callback) {
		parent[TChild[0].array_to_push] = new Array;

		var transaction = this.db.transaction([TChild[0].storename], "readonly");
		var objectStore = transaction.objectStore(TChild[0].storename);
		
		// Get everything in the store;
		var keyRange = this.IDBKeyRange.lowerBound(0);
		var cursorRequest = objectStore.openCursor(keyRange);
		
		cursorRequest.onsuccess = function(event) {
			var cursor = event.target.result;
			if(cursor) 
			{
				if (typeof cursor.value[TChild[0].key_test] != 'undefined')
				{
					if (cursor.value[TChild[0].key_test] == parent.id) parent[TChild[0].array_to_push].push(cursor.value);
				}
				else
				{
					console.log('ERROR attribute key_test ['+TChild[0].key_test+'] not exists in object store ['+TChild[0].storename+']', cursor.value);
				}
				
				cursor.continue();
			}
			else
			{
				TChild.splice(0, 1);
				DoliDb.prototype.getChildren(storename, parent, callback, TChild);
			}
		};
	};
	
	DoliDb.prototype.getItemOnKey = function(storename, keyword, TKey, callback) {
		keyword = keyword.toLowerCase();
		var TItem = new Array;
		
		var transaction =  this.db.transaction(storename, "readonly");
		var objectStore = transaction.objectStore(storename);
		
		var cursorRequest = objectStore.openCursor();
		cursorRequest.onsuccess = function(event) {
		    var cursor = event.target.result;
		    if (cursor) 
		    {
		    	for (var i in TKey)
		    	{
		    		if (typeof cursor.value[TKey[i]] != 'undefined')
		    		{
		    			if (cursor.value[TKey[i]].toLowerCase().indexOf(keyword) !== -1) // search as "%keyword%"
		    			{
			    			TItem.push(cursor.value);
			    			break;	
		    			}
		    		}
		    		else
		    		{
		    			console.log('ERROR attribute ['+TKey[i]+'] not exists in object store ['+storename+']', cursor.value);
		    		}
		    	}
		    	
		        cursor.continue();          
		    }
		    else
			{
				if (typeof callback !== 'undefined') callback(TItem);
				return false; // de toute manière c'est de l'asynchrone, donc ça sert à rien de return TItem
			}
		};
			 
	};

	DoliDb.prototype.updateItem = function(storename, id, TValue, callback) {
		
		var transaction = this.db.transaction(storename, "readwrite");
		var objectStore = transaction.objectStore(storename);
		  
		var request = objectStore.get(id.toString()); 
		request.onsuccess = function(event) 
		{
			var item = event.target.result;
			if (item !== 'undefined') 
			{
				$.extend(true, item, TValue);
				item = DoliDb.prototype.prepareItem(storename, item);
				item.update_by_indexedDB = 1; // ne pas utiliser la valeur true, indexedDb gère mal la recherche par boolean
				
				objectStore.put(item);
				
				showMessage('Update', 'The current record has been updated', 'success');
				if (typeof callback != 'undefined') callback(item);
				else return item;
			} 
			else 
			{
				showMessage('Warning', 'Item not found', 'warning');
			}
		};
		
	};
	
	DoliDb.prototype.sendAllUpdatedInLocal = function(TDataToSend) {
		var storename = TDataToSend[0].type;
		var TItem = new Array;
		
		var transaction = this.db.transaction(storename, "readwrite");
		var objectStore = transaction.objectStore(storename);
		var index = objectStore.index('update_by_indexedDB');
		
		// Get all records who updated in local
		var cursorRequest = index.openCursor(this.IDBKeyRange.only(1));
		
		cursorRequest.onsuccess = function(event) {
			var cursor = event.target.result;
			
			if(cursor)
			{
				TItem.push(cursor.value);
				cursor.continue();
			}
			else
			{
				$(TDataToSend[0].container).append('<blockquote><span class="text-info">'+TDataToSend[0].msg_start+'</span></blockquote>'); // show info : start fetching
				var data = {
					put: storename
					,jsonp: 1
					,TItem: JSON.stringify(TItem)
					,login:localStorage.dolibarr_login
					,passwd:localStorage.dolibarr_password
					,entity:1
				};
				
				var $container = $('#form_to_send_data');
				
				$container.attr('action', localStorage.interface_url);
				$container.children('input[name=put]').val(storename);
				$container.children('input[name=login]').val(localStorage.dolibarr_login);
				$container.children('input[name=passwd]').val(localStorage.dolibarr_password);
				$container.children('input[name=entity]').val(1);
				$container.children('textarea[name=TItem]').val(JSON.stringify(TItem));
				
				$container.submit();
				console.log(TItem);
				
				//TODO voir pour récupérer le retour PHP 
				var success = true;
				
				if (success)
				{
					$(TDataToSend[0].container+' blockquote:last-child').append('<small class="text-info">'+TDataToSend[0].msg_end+' ('+TItem.length+')</small>'); // show info : done
					  	
				  	TDataToSend.splice(0, 1);
				  	setTimeout(function() { 
				  		sendData(TDataToSend); // next sync
			  		},1500);
				}
				else
				{
					showMessage('Synchronization error', 'Sorry, we meet an error pending synchronization', 'danger');
					$(TDataToSend[0].container).append('<blockquote><span class="text-error" style="color:red">Error sync with "'+TDataToSend[0].type+'"</span></blockquote>');
				}
				
				/*
				$.ajax({
					url: localStorage.interface_url
					,dataType:'jsonp'
					,data: {
						put: storename
						,jsonp: 1
						,TItem: JSON.stringify(TItem)
						,login:localStorage.dolibarr_login
						,passwd:localStorage.dolibarr_password
						,entity:1
					}
					,success: function(data) {
					  	$(TDataToSend[0].container+' blockquote:last-child').append('<small class="text-info">'+TDataToSend[0].msg_end+' ('+TItem.length+')</small>'); // show info : done
					  	
					  	TDataToSend.splice(0, 1);
					  	sendData(TDataToSend); // next sync
					}
					,error: function(xhr, ajaxOptions, thrownError) {
						// TODO téchniquement on tombera jamais dans le error car pas de timeout défini, sauf qu'on peux pas le définir sinon on risque d'interrompre l'envoi des données
						// @INFO finalement pour tomber dans le "error", il semblerait qu'un "return Void" côté PHP permet d'afficher ces messages
						showMessage('Synchronization error', 'Sorry, we meet an error pending synchronization', 'danger');
						$(TDataToSend[0].container).append('<blockquote><span class="text-error" style="color:red">Error sync with "'+TDataToSend[0].type+'"</span></blockquote>');
					}
				});*/

			}
		};
	};

	DoliDb.prototype.updateAllItem = function(storename, data) {
		
		var transaction = this.db.transaction(storename, "readwrite");
		var objectStore = transaction.objectStore(storename);
		
		// Get everything in the store;
		var keyRange = this.IDBKeyRange.lowerBound(0);
		var cursorRequest = objectStore.openCursor(keyRange);
		
		cursorRequest.onsuccess = function(event) {
			var result = event.target.result;
			
			if(result)
			{
				objectStore.delete(result.key);
				result.continue();
			}
			else
			{
				for (var i in data)
				{
					data[i] = DoliDb.prototype.prepareItem(storename, data[i]);
					objectStore.put(data[i]);
				}
			}
		};
		
		cursorRequest.oncomplete = function() {};
		cursorRequest.onerror = DoliDb.prototype.indexedDB.onerror;
	};
	
	DoliDb.prototype.prepareItem = function(storename, item) {
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
	
	DoliDb.prototype.close = function() {
		this.db.close();
	};
	
	DoliDb.prototype.dropDatabase = function() {
		this.close();
		
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
	
};
*/