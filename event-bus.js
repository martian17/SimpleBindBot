

class BaseBus{
    bus = Object.create(null);
    on(type, listener){
        if(!(type in this.bus))this.bus[type] = new Map();
        this.bus[type].set(listener,true);
        return this;
    }
    off(type, listener){
        if(!(type in this.bus))return this;
        let collection = this.bus[type];
        collection.delete(listener);
        if(collection.size === 0){
            delete this.bus[type];
        }
        return this;
    }
    emit(type){
        if(!(type in this.bus))return this;
        for(let [listener] of this.bus[type]){
            listener(...[...arguments].slice(1));
        }
        return this;
    }
    once(type,listener){
        const that = this;
        const handler = function(){
            listener(...arguments);
            that.off(type,handler);
        }
        this.on(type, handler);
        return this;
    }
    next(type){
        const that = this;
        return new Promise((res)=>{
            that.once(type,(result)=>{
                res(result);
            });
        });
    }
};


let loopNestedArray = function*(arr){
    let itr = function*(a){
        for(let v of a){
            if(v instanceof Array){
                yield* itr(v);
            }else{
                yield v;
            }
        }
    }
    yield* itr(arr);
};


class EventBus extends BaseBus{
    loggers = new Map();
    on(type,listener){
        if(typeof type === "string"){
            super.on(type,listener);
        }else if(type instanceof Array){
            for(let t of loopNestedArray(type)){
                super.on(t,listener);
            }
        }
        return this;
    }
    off(type,listener){
        if(typeof type === "string"){
            super.off(type,listener);
        }else if(type instanceof Array){
            for(let t of loopNestedArray(type)){
                super.off(t,listener);
            }
        }
    }
    emit(type){
        if(!this.loggers.size !== 0){
            for(let [listener] of this.loggers){
                listener(...arguments);
            }
        }
        if(typeof type === "string"){
            super.emit(...arguments);
        }else if(type instanceof Array){
            for(let t of loopNestedArray(type)){
                for(let [listener] of this.bus[t]){
                    listener(...[...arguments].slice(1));
                }
            }
        }
        return this;
    }
    addLogger(listener){
        this.loggers.set(listener,true);
    }
    removeLogger(listener){
        this.loggers.delete(listener);
    }
};


module.exports = EventBus;



