(function(){	
    
    var Stage = function() {
        this.initialize.apply( this, arguments );
    };
    Stage.prototype = {};//new Observer();
    
    Stage.prototype.initialize = function(options) {
        this.level = options.level || 0;
        this.rows = options.rows || 4;
        this.cols = options.cols || 4;
        this.shuffleCount = options.shuffleCount || 30;
        this.pieceNum = options.rows * options.cols;
        this.pieces = [];
        this.timeLimit = options.timeLimit || 60;

        //連番を生成。
        var nums = [], i = 0;
        for (i = 1; i < this.pieceNum+1;i++){
            nums.push(i);
        }

        //各ピースの配置を配列に格納。
        for (i = 0; i < this.rows; ++i) {
            this.pieces[i] = [];
            
            for (var j = 0; j < this.cols; ++j) {
                var number = nums[ i * this.cols + j ];
                this.pieces[i][j] = number;
            }
        }        
    };

    Stage.prototype.getNumber = function(row, col){
        return this.pieces[row][col];
    };
    
    Stage.prototype.isBlank = function(row, col){
        return (this.pieces[row][col] == this.pieceNum);
    };
    
    Stage.prototype.locateBlank = function(){
        return this.locateNumber(this.pieceNum);
    };

    Stage.prototype.locateNumber = function(num){
        for (var i = 0; i < this.rows; ++i) {
            for (var j = 0; j < this.cols; ++j) {
                if (this.pieces[i][j] == num){
                    return { row: i, col: j };
                }
            }
        }        
    };
    
    Stage.prototype.swapPieces = function(num){
        // console.log("swapPieces: ", num);
        
        var piecePos = this.locateNumber(num);
        var blankPos = this.locateBlank();
        if ((piecePos.col !== blankPos.col && piecePos.row !== blankPos.row)
            || (num === this.pieceNum)){
            return false;       //動かせないピースがタップされた時はfalseを返す。
        }
        
        var stop_flag = false;  //再帰呼び出しするかどうか。
        var dx = piecePos.col - blankPos.col;   //空白ピースまでのx距離。
        if (dx === 1 || dx === -1) stop_flag = true;  //空白ピースが隣なら再帰呼び出しをストップ。
        if (dx !== 0) dx = dx / Math.abs(dx);
        var dy = piecePos.row - blankPos.row;   //空白ピースまでのy距離。
        if (dy === 1 || dy === -1) stop_flag = true;  //空白ピースが隣なら再帰呼び出しをストップ。
        if (dy !== 0) dy = dy / Math.abs(dy);
        
        var next_row = blankPos.row + dy;
        var next_col = blankPos.col + dx;
        
        //空白ピースの隣のピースの番号を得る。
        var nextNum = this.getNumber(next_row, next_col);
        
        //空白ピースとその隣のピースを入れ替える。
        this.pieces[blankPos.row][blankPos.col] = nextNum;
        this.pieces[next_row][next_col] = this.pieceNum;
        
        //this.dumpPieces();
        
        //空白ピースまでまだ距離があれば再帰呼び出し。
        if (!stop_flag) this.swapPieces(num);
        
        return true;
    };
    
    Stage.prototype.randint = function(min, max){
        return Math.floor( Math.random()*(max-min+1) ) + min;
    };

    Stage.prototype.shufflePieces = function(){
        for (var i = 0; i < this.shuffleCount; ++i){
            var blankPos = this.locateBlank();
            while(true){
                var dx = this.randint(0, this.cols-1) - blankPos.col;
                var dy = this.randint(0, this.rows-1) - blankPos.row;
                if ((dx !== 0 || dy !== 0) && (dx === 0 || dy === 0)) break;
            }
            
            var num = this.getNumber(blankPos.row + dy, blankPos.col + dx);
            this.swapPieces(num);
        }
    };
    
    Stage.prototype.checkClear = function(){
        var cnt = 1;
        for (var i = 0; i < this.rows; ++i) {
            for (var j = 0; j < this.cols; ++j) {
                var num = this.pieces[i][j];
                if (num != cnt) return false;
                cnt++;
            }
        }        
        return true;
    };
    
    Stage.prototype.dumpPieces = function(){
        for (var i = 0; i < this.rows; ++i) {
            var s = "";
            for (var j = 0; j < this.cols; ++j) {
                var num = this.pieces[i][j];
                if (num == this.pieceNum) num = " ";
                s = s + (" " + num);//.paddingLeft(3);
            }
            console.log(s);
        }        
    };

	module.exports = Stage;
}).call(this);



