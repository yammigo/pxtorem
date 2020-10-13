(function( window , document ){

	'use strict';

	//给pxToRem开辟个命名空间。
	var pxToRem = {};

	(function() {
        //根据devicePixelRatio自定计算scale
        //可以有效解决移动端1px这个世纪难题。
        var viewportEl = document.querySelector('meta[name="viewport"]'),
            pxToRemEl = document.querySelector('meta[name="pxToRem"]'),
            dpr = window.devicePixelRatio || 1,
            maxWidth = 540,
            designWidth = 0;

        dpr = dpr >= 3 ? 3 : ( dpr >=2 ? 2 : 1 );

        //允许通过自定义name为pxToRem的meta头，通过initial-dpr来强制定义页面缩放
        if (pxToRemEl) {
            var pxToRemCon = pxToRemEl.getAttribute('content');
            if (pxToRemCon) {
                var initialDprMatch = pxToRemCon.match(/initial\-dpr=([\d\.]+)/);
                if (initialDprMatch) {
                    dpr = parseFloat(initialDprMatch[1]);
                }
                var maxWidthMatch = pxToRemCon.match(/max\-width=([\d\.]+)/);
                if (maxWidthMatch) {
                    maxWidth = parseFloat(maxWidthMatch[1]);
                }
                var designWidthMatch = pxToRemCon.match(/design\-width=([\d\.]+)/);
                if (designWidthMatch) {
                    designWidth = parseFloat(designWidthMatch[1]);
                }
            }
        }

        document.documentElement.setAttribute('data-dpr', dpr);
        pxToRem.dpr = dpr;

        document.documentElement.setAttribute('max-width', maxWidth);
        pxToRem.maxWidth = maxWidth;

        if( designWidth ){
            document.documentElement.setAttribute('design-width', designWidth);
        }
        pxToRem.designWidth = designWidth; // 保证px2rem 和 rem2px 不传第二个参数时, 获取pxToRem.designWidth是undefined导致的NaN

        var scale = 1 / dpr,
            content = 'width=device-width, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=no';

        if (viewportEl) {
            viewportEl.setAttribute('content', content);
        } else {
            viewportEl = document.createElement('meta');
            viewportEl.setAttribute('name', 'viewport');
            viewportEl.setAttribute('content', content);
            document.head.appendChild(viewportEl);
        }

    })();

	pxToRem.px2rem = function( px , designWidth ){
		//预判你将会在JS中用到尺寸，特提供一个方法助你在JS中将px转为rem。就是这么贴心。
		if( !designWidth ){
			//如果你在JS中大量用到此方法，建议直接定义 pxToRem.designWidth 来定义设计图尺寸;
			//否则可以在第二个参数告诉我你的设计图是多大。
			designWidth = parseInt(pxToRem.designWidth , 10);
		}

		return parseInt(px,10)*320/designWidth/20;
	}

	pxToRem.rem2px = function( rem , designWidth ){
		//新增一个rem2px的方法。用法和px2rem一致。
		if( !designWidth ){
			designWidth = parseInt(pxToRem.designWidth , 10);
		}
		//rem可能为小数，这里不再做处理了
		return rem*20*designWidth/320;
	}

	pxToRem.mresize = function(){
		//对，这个就是核心方法了，给HTML设置font-size。
		var innerWidth = document.documentElement.getBoundingClientRect().width || window.innerWidth;

        if( pxToRem.maxWidth && (innerWidth/pxToRem.dpr > pxToRem.maxWidth) ){
            innerWidth = pxToRem.maxWidth*pxToRem.dpr;
        }

		if( !innerWidth ){ return false;}

		document.documentElement.style.fontSize = ( innerWidth*20/320 ) + 'px';

        pxToRem.callback && pxToRem.callback();

	};

	pxToRem.mresize(); 
	//直接调用一次

	window.addEventListener( 'resize' , function(){
		clearTimeout( pxToRem.tid );
		pxToRem.tid = setTimeout( pxToRem.mresize , 33 );
	} , false ); 
	//绑定resize的时候调用

	window.addEventListener( 'load' , pxToRem.mresize , false ); 
	//防止不明原因的bug。load之后再调用一次。


	setTimeout(function(){
		pxToRem.mresize(); 
		//防止某些机型怪异现象，异步再调用一次
	},333)

	window.pxToRem = pxToRem; 


})( window , document );