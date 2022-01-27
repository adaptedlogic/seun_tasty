var betApp = angular.module('betApp', ['angularMoment']);

betApp.run([
    '$rootScope',
    '$window',
    function($rootScope, $window) {
        var firebaseConfig = {
            apiKey: "AIzaSyCm_uzsBlcOXfcTciXZPdPpmXhm-qxPqBE",
            authDomain: "food-cart-c46ec.firebaseapp.com",
            projectId: "food-cart-c46ec",
            storageBucket: "food-cart-c46ec.appspot.com",
            messagingSenderId: "534297056864",
            appId: "1:534297056864:web:7b0f95cdcd715cee105505",
            measurementId: "G-XBHS08WT2Y"
        };
        // Initialize Firebase
        try {
            $window.firebase.initializeApp(firebaseConfig);
            $window.firebase.analytics();
            $rootScope.db = firebase.firestore();
            $rootScope.storage = firebase.storage();
            console.log($rootScope.storage);
        } catch (error) {
            console.log(error);
        }
    },
]);

betApp.controller('MainController', function(
    $scope,
    moment,
    $window,
    $rootScope,
    $timeout
) {
    var min = 1;
    var max = 90;
    var index = 0;
    $scope.loading = true;
    $scope.search_val = "";
    $scope.canLoad = false;

    $rootScope.num_list = [];
    $rootScope.num_list2 = [];
    $scope.data = [];






    $scope.canLoad = true;
    loadNumbersFromServer();
    $scope.loading = false;



    $scope.viewDetails = function(graint) {



        $window.localStorage.setItem("seed", JSON.stringify(graint));
        window.location.href = "./num_details.html";


    }

    $scope.deleteRecord = function(form) {

        if (confirm("Are you sure, you want to delete the record?")) {
            $rootScope.db
                .collection('grants')
                .doc(`${form.fullname}-${form.amount}`)
                .delete()
                .then(() => {
                    window.location.href = "./index.html";


                })
                .catch(error => {
                    alert('Error adding document: ', error);
                });

        }

    };





    function loadNumbersFromServer() {
        try {
            console.log($scope.search_val);
            $rootScope.db.collection('grants').get().then(result => {
                const data = result.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                $window.localStorage.setItem("data", JSON.stringify(data))

                $scope.$apply(function() {
                    $rootScope.data = data;
                    $scope.loading = false;
                    $scope.data = data;

                });
                console.log('All numbers in collections', data);
            });
        } catch (error) {

        }
    };



    ///  Entry form
});

betApp.controller('MainCatController', function(
    $scope,
    moment,
    $window,
    $rootScope,
    $timeout
) {

    $scope.form = {
        name: '',
        description: '',
    };
    $scope.form2 = {
        name: '',
        description: '',
    };

    $scope.data = [];

    loadNumbersFromServer();


    $scope.submitForm = function() {

        var guid = createGuid();

        $rootScope.db
            .collection('categories')
            .doc(`${guid}`)
            .set({
                id: `${ guid}`,
                name: `${$scope.form.name}`,
                description: `${$scope.form.description}`,
                url: '',
            })
            .then(() => {
                $scope.form.name = "";
                loadNumbersFromServer();
                alert(`Created!`);

            })
            .catch(error => {
                console.error('Error adding document: ', error);
            });


    };

    $scope.editCategoryItem = function(cat) {
        console.log(cat);
        $("#modal2").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false,
            fadeDuration: 250,
            fadeDelay: 0.80
        });
        $scope.form2 = cat;



    }

    $scope.updateForm = function() {
        $rootScope.db
            .collection('categories')
            .doc(`${$scope.form2.id}`)
            .set({
                id: `${ $scope.form2.id}`,
                name: `${$scope.form2.name}`,
                description: `${$scope.form2.description}`,
                url: `${$scope.form2.url}`,
            })
            .then(() => {
                loadNumbersFromServer();


            })
            .catch(error => {
                console.error('Error editing document: ', error);
            });

    }

    $scope.deleteCategoryItem = function(cat) {
        console.log(cat);
        if (confirm("Are you sure, you want to delete the record?")) {
            $rootScope.db
                .collection('categories')
                .doc(`${cat.id}`)
                .delete()
                .then(() => {
                    loadNumbersFromServer();


                })
                .catch(error => {
                    alert('Error deleting document: ', error);
                });

        }

    }


    function loadNumbersFromServer() {
        try {
            $rootScope.db.collection('categories').get().then(result => {
                const data = result.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));



                $scope.$apply(function() {
                    $rootScope.data = data;
                    $scope.loading = false;
                    $scope.data = data;

                });
                console.log('All numbers in collections', data);
            });
        } catch (error) {

        }
    };

    function createGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    $scope.uploadPhoto = function(cat) {
        console.log(cat);
        $("#modal3").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false,
            fadeDuration: 250,
            fadeDelay: 0.80
        });
        $scope.form2 = cat;



    }

    $scope.processPhoto = function() {

        if ($window.clientPhotos.length != 0) {
            console.log($window.clientPhotos);
            var file = $window.clientPhotos[0];
            var filename = createGuid();
            console.log($rootScope.storage);
            var storage = $rootScope.storage.ref(filename);
            var upload = storage.put(file);

            upload.on(
                "state_changed",
                function progress(snapshot) {

                    $scope.$apply(function() {

                        var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        document.getElementById("progress").value = percentage;
                    });

                },

                function error() {
                    alert("error uploading file");
                },

                function complete() {
                    document.getElementById(
                        "uploading"
                    ).innerHTML += `${file.name} upoaded <br />`;

                    storage
                        .getDownloadURL()
                        .then(function(url) {
                            $scope.form2.url = url;

                            updateCategory($scope.form2);
                        })
                        .catch(function(error) {
                            console.log("error encountered");
                        });

                }
            );


        } else {
            alert("No file chosen");
        }

    }

    function updateCategory(p) {


        $rootScope.db
            .collection('categories')
            .doc(`${p.id}`)
            .set({
                name: `${p.name}`,
                description: `${p.description}`,
                url: `${p.url}`,
            })
            .then(() => {
                loadNumbersFromServer();


            })
            .catch(error => {
                console.error('Error adding document: ', error);
            });


    };




});


betApp.controller('ProductController', function(
    $scope,
    moment,
    $window,
    $rootScope,
    $timeout
) {

    $scope.form = {
        name: '',
    };
    $scope.form2 = {
        name: '',
    };

    $scope.data = [];
    $scope.categories = [];

    loadProductsFromServer();
    loadCategoriesFromServer();


    $scope.submitForm = function() {

        var guid = createGuid();

        $rootScope.db
            .collection('products')
            .doc(`${guid}`)
            .set({
                id: `${ guid}`,
                name: `${$scope.form.name}`,
                category: `${$scope.form.category.split("@@@")[0]}`,
                categoryID: `${$scope.form.category.split("@@@")[1]}`,
                price: `${$scope.form.price}`,
                url: '',
            })
            .then(() => {
                $scope.form = {};
                loadProductsFromServer();
                alert(`Created!`);

            })
            .catch(error => {
                console.error('Error adding document: ', error);
            });


    };

    $scope.uploadPhoto = function(product) {
        console.log(product);
        $("#modal3").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false,
            fadeDuration: 250,
            fadeDelay: 0.80
        });
        $scope.form2 = product;



    }

    $scope.processPhoto = function() {

        if ($window.clientPhotos.length != 0) {
            console.log($window.clientPhotos);
            var file = $window.clientPhotos[0];
            var filename = createGuid();
            var storage = $rootScope.storage.ref(filename);
            var upload = storage.put(file);

            upload.on(
                "state_changed",
                function progress(snapshot) {
                    var percentage =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    document.getElementById("progress").value = percentage;
                },

                function error() {
                    alert("error uploading file");
                },

                function complete() {
                    document.getElementById(
                        "uploading"
                    ).innerHTML += `${file.name} upoaded <br />`;

                    storage
                        .getDownloadURL()
                        .then(function(url) {
                            $scope.form2.url = url;

                            updateProduct($scope.form2);
                        })
                        .catch(function(error) {
                            console.log("error encountered");
                        });

                }
            );


        } else {
            alert("No file chosen");
        }




    }

    function updateProduct(p) {


        $rootScope.db
            .collection('products')
            .doc(`${p.id}`)
            .set({
                id: `${ p.id}`,
                name: `${p.name}`,
                category: `${p.category}`,
                categoryID: `${p.categoryID}`,
                price: `${p.price}`,
                url: `${p.url}`,
            })
            .then(() => {
                loadProductsFromServer();


            })
            .catch(error => {
                console.error('Error adding document: ', error);
            });


    };


    $scope.editProduct = function(p) {

        $scope.form2 = p;



        $("#modal2").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false,
            fadeDuration: 250,
            fadeDelay: 0.80
        });


    }

    $scope.updateForm = function() {

        var catText = $("#category2 option:selected").text();

        $scope.form2.category = catText;
        $rootScope.db
            .collection('products')
            .doc(`${$scope.form2.id}`)
            .set({
                id: `${ $scope.form2.id}`,
                name: `${$scope.form2.name}`,
                category: `${$scope.form2.category}`,
                categoryID: `${$scope.form2.categoryID}`,
                price: `${$scope.form2.price}`,
                url: `${$scope.form2.url}`,
            })
            .then(() => {
                $scope.form = {};
                loadProductsFromServer();
                alert(`Edited!`);

            })
            .catch(error => {
                console.error('Error adding document: ', error);
            });



    }

    $scope.deleteProduct = function(p) {
        if (confirm("Are you sure, you want to delete the record?")) {
            $rootScope.db
                .collection('products')
                .doc(`${p.id}`)
                .delete()
                .then(() => {
                    loadProductsFromServer();


                })
                .catch(error => {
                    alert('Error deleting document: ', error);
                });

        }

    }


    function loadProductsFromServer() {
        try {
            $rootScope.db.collection('products').get().then(result => {
                const data = result.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));



                $scope.$apply(function() {
                    $scope.data = data;

                });
                console.log('All numbers in collections', data);
            });
        } catch (error) {

        }
    };

    function loadCategoriesFromServer() {
        try {
            $rootScope.db.collection('categories').get().then(result => {
                const data = result.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));



                $scope.$apply(function() {
                    $scope.categories = data;

                });
                console.log('All numbers in collections', data);
            });
        } catch (error) {

        }

    };

    function createGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

});


betApp.controller('DetailsController', function(
    $scope,
    moment,
    $window,
    $rootScope,
    $timeout
) {




    var seed = JSON.parse($window.localStorage.getItem("seed"));
    console.log(seed);

    $scope.form = seed;

    $scope.submitForm = function() {

        console.log($scope.form);

        $rootScope.db
            .collection('grants')
            .doc(`${$scope.form.fullname}-${$scope.form.amount}`)
            .set({
                id: `${ $scope.form.fullname} - ${ $scope.form.amount}`,
                fullname: `${$scope.form.fullname}`,
                status: `${$scope.form.status}`,
                gender: `${$scope.form.gender}`,
                amount: `${$scope.form.amount}`,
                tax: `${$scope.form.tax}`,
                country: `${$scope.form.country}`,
            })
            .then(() => {
                alert("The form was Edited");


            })
            .catch(error => {
                alert('Error adding document: ', error);
            });

    };




})