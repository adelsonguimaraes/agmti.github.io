/*******************************************
		Controller de Conta
*******************************************/
var contaCtrl = function ($scope, $rootScope, $location, genericAPI, $timeout) {
    
        //verifica sessao
        if(!$rootScope.usuario) {
        	$location.path('/login');
        	return false;
        }

        function iniciaScope () {
            $scope.conta = {
                "id":null,
                "idusuario":"",
                "idcategoria":"",
                "descricao":"",
                "valor":formataValor('0.00'),
                "parcela":'INDETERMINADO',
                "indeterminada":"NAO",
                "tipo":"APAGAR",
                "status":null,
                "datavencimento": moment()._d//new Date()
            };
            $scope.dataatual = moment().format('YYYY-MM-DD');
            $scope.nova = false;
            
        }
        iniciaScope();
    
        $scope.novaConta = function () {
            $scope.nova = true;
        }

        /* Monta lista de Parcelas pro Select */
        var montaParcelas = function () {
            $scope.parcelas = [];
            $scope.parcelas.push('INDETERMINADO');
            for (var x=1; x<=420; x++) {
                $scope.parcelas.push(x);
            }
        };
        montaParcelas();

        $scope.listarContasPorUsuario = function (page) {
            $rootScope.startLoad();
            // listando do DBLocal
            var metodo = (page === 'apagar') ? 'listarContasAPagarPorUsuario' : 'listarContasAReceberPorUsuario';

            contaDAO[metodo]($rootScope.usuario.idusuario).then(response => {
                $timeout(() => {
                    if (response.success) {
                        if (response.data.length > 0) {
                            $scope.contas = response.data;
                            $rootScope.stopLoad();
                            $scope.$apply();
                        }else{
                            // verifica conectividade
                            if (!$rootScope.onLine) return false;
                            var data = {
                                "metodo":metodo,
                                "class":"conta"
                            };
                            genericAPI.generic(data)
                            .then(function successCallback(response) {
                                if( response.data.success === true ){
                                    $scope.contas = response.data.data;                                    
                                    $rootScope.stopLoad();
                                    // $scope.$apply();
                                }else{
                                    console.log( response.data.msg );
                                }
                            }, function errorCallback(response) {
                                //error
                            });	
                        }
                    }
                }, 0);
            });
        };
        $scope.page = window.location.href.substring(window.location.href.lastIndexOf('/')+1);
        $scope.listarContasPorUsuario($scope.page);

        $scope.listarCategorias = function (page) {
            $scope.categorias = [];

            var tipo = (page === 'apagar') ? 'APAGAR' : 'ARECEBER';
            
            // listando localmente
            categoriaDAO.listarPorTipo(tipo).then(response => {
                if (response.success) {
                    $scope.categorias = response.data;
                    if ($scope.categorias.length > 0) {
                        $scope.conta.idcategoria = $scope.categorias[0].id;
                    }else{
                        // verifica conectividade
                        if (!$rootScope.onLine) return false;
                        // listagem pela nuvem
                        var metodo = (page === 'apagar') ? 'listarCategoriaContasAPagar' : 'listarCategoriasContasAReceber';
                        var data = {
                            "metodo":metodo,
                            "class":"categoria"
                        };
                        genericAPI.generic(data)
                        .then(function successCallback(response) {
                            if( response.data.success === true ){
                                $scope.categorias = response.data.data;
                                $scope.conta.idcategoria = $scope.categorias[0].id;
                            }else{
                                console.log( response.data.msg );
                            }
                        }, function errorCallback(response) {
                            //error
                        });	
                    }
                }
                $scope.$apply(); 
            });
        }
        $scope.listarCategorias($scope.page);

        $scope.editar = function (obj) {
            
            var newObj = angular.copy(obj);
            
            newObj.datavencimento = moment(newObj.datavencimento)._d;
            newObj.parcela = (+newObj.parcela === 0) ? 'INDETERMINADO' : newObj.parcela;
            $scope.dataatual = moment(newObj.datavencimento).format('YYYY-MM-DD');
            $scope.conta = newObj;
            $scope.novaConta();
        }
    
        $scope.salvar = function (obj) {
            $rootScope.startLoad();

            var newObj = angular.copy(obj);

            newObj.idusuario = $rootScope.usuario.idusuario;
            newObj.valor = desformataValor(newObj.valor);
            // calculando o valor total baseado nas parcelas
            if ( newObj.parcela === 'INDETERMINADO' ) {
                // caso a parcela seja indeterminada, o sistema seta para salvar em banco o valor 0;
                // o valor total assume o valor da parcela informada
                newObj.parcela = 0;
            }else{
                // caso a parcela seja diferente de 0
                // o sistema multiplica o valor pela parcela para descubrir o valor total
                newObj.valor = newObj.valor*newObj.parcela;
            }
            // newObj.parcela = (newObj.parcela === 'INDETERMINADO') ? 0 : newObj.parcela;
            newObj.datavencimento = moment(newObj.datavencimento).format('YYYY-MM-DD');
            if ($scope.page === 'areceber') {
                newObj.tipo = 'ARECEBER';
            }
            
            var metodo = "cadastrar";
            if(+newObj.id > 0) {
                metodo = "atualizar";
            }
            
            if (indexedDBCtrl.support) {
                contaDAO[metodo](newObj).then(response => {
                    if (response.success) {
                        iniciaScope();
                        $scope.listarContasPorUsuario($scope.page);
                        $rootScope.stopLoad();
                        // $rootScope.syncDB('conta', 'listarContasPorUsuario');
                    }
                });
                return false;
            };

            if (!navigator.onLine) return false;

            var data = {
                "metodo":metodo,
                "data":obnewObj,
                "class":"conta"
            };
            genericAPI.generic(data)
                .then(function successCallback(response) {
                    //success
                    iniciaScope();
                    $scope.listarContasPorUsuario($scope.page);
                    // $rootScope.syncDB('conta', 'listarContasPorUsuario');
                    $rootScope.stopLoad();
                }, function errorCallback(response) {
                    //error
                });	
        }
    
        $scope.deletar = function (obj) {
            
            let = r = confirm('Deseja realmente desativar?');
            if (!r) {
                console.log('Cancelado');
                return false;
            }

            contaDAO.desativar(obj).then(response => {
                if (response) {
                    iniciaScope();
                    $scope.listarContasPorUsuario($scope.page);
                }
            });

            // var data = {
            //     "metodo":"deletar",
            //     "data":obj,
            //     "class":"conta"
            // };
            // genericAPI.generic(data)
            //     .then(function successCallback(response) {
            //         if( response.data.success === true ){
            //             iniciaScope();
            //             $scope.listar();
            //         }else{
            //             alert( response.data.msg );
            //         }
            //     }, function errorCallback(response) {
            //         //error
            //     });	
        }
    
        $scope.cancelar = function () {
            iniciaScope();
        }

        $scope.fecharConta = function () {
            $location.path('/emaberto');
        }

        setTimeout(()=>{
            var x = ($scope.page === 'apagar') ? 'despesa' : 'recebimento';
            setActivatedMenu(document.getElementById('menu_'+x));
        }, 200);
    }
    
    angular
        .module('cfp')
        .controller('contaCtrl', contaCtrl);