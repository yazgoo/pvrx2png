// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 31544;





var _stdout;
var _stdout=_stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
var _stdin;
var _stdin=_stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;































































/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } },{ func: function() { __GLOBAL__I_a() } });









































































































































































































































































































































































































































































































































































var ___fsmu8;
var ___dso_handle;
var ___dso_handle=___dso_handle=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;














































































































































var __ZTVN10__cxxabiv120__si_class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,0,106,0,0,26,1,0,0,20,1,0,0,74,0,0,0,170,0,0,0,14,0,0,0,10,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,16,106,0,0,26,1,0,0,96,0,0,0,74,0,0,0,170,0,0,0,14,0,0,0,28,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;










































































































































































var __ZTISt9exception;












































































































































































































































































































var __ZNSt13runtime_errorC1EPKc;
var __ZNSt13runtime_errorD1Ev;
var __ZNSt12length_errorD1Ev;
var __ZNSt12out_of_rangeD1Ev;
var __ZNSt3__16localeC1Ev;
var __ZNSt3__16localeC1ERKS0_;
var __ZNSt3__16localeD1Ev;
var __ZNSt8bad_castC1Ev;
var __ZNSt8bad_castD1Ev;
/* memory initializer */ allocate([96,51,0,0,48,65,0,0,184,106,0,0,48,56,0,0,8,53,0,0,64,51,0,0,64,49,0,0,16,47,0,0,240,45,0,0,184,106,0,0,0,64,128,192,16,80,144,208,32,96,160,224,48,112,176,240,4,68,132,196,20,84,148,212,36,100,164,228,52,116,180,244,8,72,136,200,24,88,152,216,40,104,168,232,56,120,184,248,12,76,140,204,28,92,156,220,44,108,172,236,60,124,188,252,1,65,129,193,17,81,145,209,33,97,161,225,49,113,177,241,5,69,133,197,21,85,149,213,37,101,165,229,53,117,181,245,9,73,137,201,25,89,153,217,41,105,169,233,57,121,185,249,13,77,141,205,29,93,157,221,45,109,173,237,61,125,189,253,2,66,130,194,18,82,146,210,34,98,162,226,50,114,178,242,6,70,134,198,22,86,150,214,38,102,166,230,54,118,182,246,10,74,138,202,26,90,154,218,42,106,170,234,58,122,186,250,14,78,142,206,30,94,158,222,46,110,174,238,62,126,190,254,3,67,131,195,19,83,147,211,35,99,163,227,51,115,179,243,7,71,135,199,23,87,151,215,39,103,167,231,55,119,183,247,11,75,139,203,27,91,155,219,43,107,171,235,59,123,187,251,15,79,143,207,31,95,159,223,47,111,175,239,63,127,191,255,12,0,8,0,140,0,8,0,76,0,8,0,204,0,8,0,44,0,8,0,172,0,8,0,108,0,8,0,236,0,8,0,28,0,8,0,156,0,8,0,92,0,8,0,220,0,8,0,60,0,8,0,188,0,8,0,124,0,8,0,252,0,8,0,2,0,8,0,130,0,8,0,66,0,8,0,194,0,8,0,34,0,8,0,162,0,8,0,98,0,8,0,226,0,8,0,18,0,8,0,146,0,8,0,82,0,8,0,210,0,8,0,50,0,8,0,178,0,8,0,114,0,8,0,242,0,8,0,10,0,8,0,138,0,8,0,74,0,8,0,202,0,8,0,42,0,8,0,170,0,8,0,106,0,8,0,234,0,8,0,26,0,8,0,154,0,8,0,90,0,8,0,218,0,8,0,58,0,8,0,186,0,8,0,122,0,8,0,250,0,8,0,6,0,8,0,134,0,8,0,70,0,8,0,198,0,8,0,38,0,8,0,166,0,8,0,102,0,8,0,230,0,8,0,22,0,8,0,150,0,8,0,86,0,8,0,214,0,8,0,54,0,8,0,182,0,8,0,118,0,8,0,246,0,8,0,14,0,8,0,142,0,8,0,78,0,8,0,206,0,8,0,46,0,8,0,174,0,8,0,110,0,8,0,238,0,8,0,30,0,8,0,158,0,8,0,94,0,8,0,222,0,8,0,62,0,8,0,190,0,8,0,126,0,8,0,254,0,8,0,1,0,8,0,129,0,8,0,65,0,8,0,193,0,8,0,33,0,8,0,161,0,8,0,97,0,8,0,225,0,8,0,17,0,8,0,145,0,8,0,81,0,8,0,209,0,8,0,49,0,8,0,177,0,8,0,113,0,8,0,241,0,8,0,9,0,8,0,137,0,8,0,73,0,8,0,201,0,8,0,41,0,8,0,169,0,8,0,105,0,8,0,233,0,8,0,25,0,8,0,153,0,8,0,89,0,8,0,217,0,8,0,57,0,8,0,185,0,8,0,121,0,8,0,249,0,8,0,5,0,8,0,133,0,8,0,69,0,8,0,197,0,8,0,37,0,8,0,165,0,8,0,101,0,8,0,229,0,8,0,21,0,8,0,149,0,8,0,85,0,8,0,213,0,8,0,53,0,8,0,181,0,8,0,117,0,8,0,245,0,8,0,13,0,8,0,141,0,8,0,77,0,8,0,205,0,8,0,45,0,8,0,173,0,8,0,109,0,8,0,237,0,8,0,29,0,8,0,157,0,8,0,93,0,8,0,221,0,8,0,61,0,8,0,189,0,8,0,125,0,8,0,253,0,8,0,19,0,9,0,19,1,9,0,147,0,9,0,147,1,9,0,83,0,9,0,83,1,9,0,211,0,9,0,211,1,9,0,51,0,9,0,51,1,9,0,179,0,9,0,179,1,9,0,115,0,9,0,115,1,9,0,243,0,9,0,243,1,9,0,11,0,9,0,11,1,9,0,139,0,9,0,139,1,9,0,75,0,9,0,75,1,9,0,203,0,9,0,203,1,9,0,43,0,9,0,43,1,9,0,171,0,9,0,171,1,9,0,107,0,9,0,107,1,9,0,235,0,9,0,235,1,9,0,27,0,9,0,27,1,9,0,155,0,9,0,155,1,9,0,91,0,9,0,91,1,9,0,219,0,9,0,219,1,9,0,59,0,9,0,59,1,9,0,187,0,9,0,187,1,9,0,123,0,9,0,123,1,9,0,251,0,9,0,251,1,9,0,7,0,9,0,7,1,9,0,135,0,9,0,135,1,9,0,71,0,9,0,71,1,9,0,199,0,9,0,199,1,9,0,39,0,9,0,39,1,9,0,167,0,9,0,167,1,9,0,103,0,9,0,103,1,9,0,231,0,9,0,231,1,9,0,23,0,9,0,23,1,9,0,151,0,9,0,151,1,9,0,87,0,9,0,87,1,9,0,215,0,9,0,215,1,9,0,55,0,9,0,55,1,9,0,183,0,9,0,183,1,9,0,119,0,9,0,119,1,9,0,247,0,9,0,247,1,9,0,15,0,9,0,15,1,9,0,143,0,9,0,143,1,9,0,79,0,9,0,79,1,9,0,207,0,9,0,207,1,9,0,47,0,9,0,47,1,9,0,175,0,9,0,175,1,9,0,111,0,9,0,111,1,9,0,239,0,9,0,239,1,9,0,31,0,9,0,31,1,9,0,159,0,9,0,159,1,9,0,95,0,9,0,95,1,9,0,223,0,9,0,223,1,9,0,63,0,9,0,63,1,9,0,191,0,9,0,191,1,9,0,127,0,9,0,127,1,9,0,255,0,9,0,255,1,9,0,0,0,7,0,64,0,7,0,32,0,7,0,96,0,7,0,16,0,7,0,80,0,7,0,48,0,7,0,112,0,7,0,8,0,7,0,72,0,7,0,40,0,7,0,104,0,7,0,24,0,7,0,88,0,7,0,56,0,7,0,120,0,7,0,4,0,7,0,68,0,7,0,36,0,7,0,100,0,7,0,20,0,7,0,84,0,7,0,52,0,7,0,116,0,7,0,3,0,8,0,131,0,8,0,67,0,8,0,195,0,8,0,35,0,8,0,163,0,8,0,99,0,8,0,227,0,8,0,48,1,0,0,168,9,0,0,1,1,0,0,30,1,0,0,15,0,0,0,0,0,0,0,0,0,5,0,16,0,5,0,8,0,5,0,24,0,5,0,4,0,5,0,20,0,5,0,12,0,5,0,28,0,5,0,2,0,5,0,18,0,5,0,10,0,5,0,26,0,5,0,6,0,5,0,22,0,5,0,14,0,5,0,30,0,5,0,1,0,5,0,17,0,5,0,9,0,5,0,25,0,5,0,5,0,5,0,21,0,5,0,13,0,5,0,29,0,5,0,3,0,5,0,19,0,5,0,11,0,5,0,27,0,5,0,7,0,5,0,23,0,5,0,200,5,0,0,32,10,0,0,0,0,0,0,30,0,0,0,15,0,0,0,0,0,0,0,0,0,0,0,152,10,0,0,0,0,0,0,19,0,0,0,7,0,0,0,0,0,0,0,122,84,88,116,0,0,0,0,116,82,78,83,0,0,0,0,116,73,77,69,0,0,0,0,116,69,88,116,0,0,0,0,115,82,71,66,0,0,0,0,115,80,76,84,0,0,0,0,115,67,65,76,0,0,0,0,115,66,73,84,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,4,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,4,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,112,72,89,115,0,0,0,0,112,67,65,76,0,0,0,0,111,70,70,115,0,0,0,0,49,46,50,46,51,57,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,105,67,67,80,0,0,0,0,104,73,83,84,0,0,0,0,103,65,77,65,0,0,0,0,99,72,82,77,0,0,0,0,98,75,71,68,0,0,0,0,80,76,84,69,0,0,0,0,73,72,68,82,0,0,0,0,73,69,78,68,0,0,0,0,73,68,65,84,0,0,0,0,0,128,64,192,32,160,96,224,16,144,80,208,48,176,112,240,8,136,72,200,40,168,104,232,24,152,88,216,56,184,120,248,4,132,68,196,36,164,100,228,20,148,84,212,52,180,116,244,12,140,76,204,44,172,108,236,28,156,92,220,60,188,124,252,2,130,66,194,34,162,98,226,18,146,82,210,50,178,114,242,10,138,74,202,42,170,106,234,26,154,90,218,58,186,122,250,6,134,70,198,38,166,102,230,22,150,86,214,54,182,118,246,14,142,78,206,46,174,110,238,30,158,94,222,62,190,126,254,1,129,65,193,33,161,97,225,17,145,81,209,49,177,113,241,9,137,73,201,41,169,105,233,25,153,89,217,57,185,121,249,5,133,69,197,37,165,101,229,21,149,85,213,53,181,117,245,13,141,77,205,45,173,109,237,29,157,93,221,61,189,125,253,3,131,67,195,35,163,99,227,19,147,83,211,51,179,115,243,11,139,75,203,43,171,107,235,27,155,91,219,59,187,123,251,7,135,71,199,39,167,103,231,23,151,87,215,55,183,119,247,15,143,79,207,47,175,111,239,31,159,95,223,63,191,127,255,0,16,32,48,64,80,96,112,128,144,160,176,192,208,224,240,1,17,33,49,65,81,97,113,129,145,161,177,193,209,225,241,2,18,34,50,66,82,98,114,130,146,162,178,194,210,226,242,3,19,35,51,67,83,99,115,131,147,163,179,195,211,227,243,4,20,36,52,68,84,100,116,132,148,164,180,196,212,228,244,5,21,37,53,69,85,101,117,133,149,165,181,197,213,229,245,6,22,38,54,70,86,102,118,134,150,166,182,198,214,230,246,7,23,39,55,71,87,103,119,135,151,167,183,199,215,231,247,8,24,40,56,72,88,104,120,136,152,168,184,200,216,232,248,9,25,41,57,73,89,105,121,137,153,169,185,201,217,233,249,10,26,42,58,74,90,106,122,138,154,170,186,202,218,234,250,11,27,43,59,75,91,107,123,139,155,171,187,203,219,235,251,12,28,44,60,76,92,108,124,140,156,172,188,204,220,236,252,13,29,45,61,77,93,109,125,141,157,173,189,205,221,237,253,14,30,46,62,78,94,110,126,142,158,174,190,206,222,238,254,15,31,47,63,79,95,111,127,143,159,175,191,207,223,239,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,5,0,0,0,6,0,0,0,6,0,0,0,7,0,0,0,7,0,0,0,8,0,0,0,8,0,0,0,9,0,0,0,9,0,0,0,10,0,0,0,10,0,0,0,11,0,0,0,11,0,0,0,12,0,0,0,12,0,0,0,13,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,7,0,0,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,0,0,0,0,150,48,7,119,44,97,14,238,186,81,9,153,25,196,109,7,143,244,106,112,53,165,99,233,163,149,100,158,50,136,219,14,164,184,220,121,30,233,213,224,136,217,210,151,43,76,182,9,189,124,177,126,7,45,184,231,145,29,191,144,100,16,183,29,242,32,176,106,72,113,185,243,222,65,190,132,125,212,218,26,235,228,221,109,81,181,212,244,199,133,211,131,86,152,108,19,192,168,107,100,122,249,98,253,236,201,101,138,79,92,1,20,217,108,6,99,99,61,15,250,245,13,8,141,200,32,110,59,94,16,105,76,228,65,96,213,114,113,103,162,209,228,3,60,71,212,4,75,253,133,13,210,107,181,10,165,250,168,181,53,108,152,178,66,214,201,187,219,64,249,188,172,227,108,216,50,117,92,223,69,207,13,214,220,89,61,209,171,172,48,217,38,58,0,222,81,128,81,215,200,22,97,208,191,181,244,180,33,35,196,179,86,153,149,186,207,15,165,189,184,158,184,2,40,8,136,5,95,178,217,12,198,36,233,11,177,135,124,111,47,17,76,104,88,171,29,97,193,61,45,102,182,144,65,220,118,6,113,219,1,188,32,210,152,42,16,213,239,137,133,177,113,31,181,182,6,165,228,191,159,51,212,184,232,162,201,7,120,52,249,0,15,142,168,9,150,24,152,14,225,187,13,106,127,45,61,109,8,151,108,100,145,1,92,99,230,244,81,107,107,98,97,108,28,216,48,101,133,78,0,98,242,237,149,6,108,123,165,1,27,193,244,8,130,87,196,15,245,198,217,176,101,80,233,183,18,234,184,190,139,124,136,185,252,223,29,221,98,73,45,218,21,243,124,211,140,101,76,212,251,88,97,178,77,206,81,181,58,116,0,188,163,226,48,187,212,65,165,223,74,215,149,216,61,109,196,209,164,251,244,214,211,106,233,105,67,252,217,110,52,70,136,103,173,208,184,96,218,115,45,4,68,229,29,3,51,95,76,10,170,201,124,13,221,60,113,5,80,170,65,2,39,16,16,11,190,134,32,12,201,37,181,104,87,179,133,111,32,9,212,102,185,159,228,97,206,14,249,222,94,152,201,217,41,34,152,208,176,180,168,215,199,23,61,179,89,129,13,180,46,59,92,189,183,173,108,186,192,32,131,184,237,182,179,191,154,12,226,182,3,154,210,177,116,57,71,213,234,175,119,210,157,21,38,219,4,131,22,220,115,18,11,99,227,132,59,100,148,62,106,109,13,168,90,106,122,11,207,14,228,157,255,9,147,39,174,0,10,177,158,7,125,68,147,15,240,210,163,8,135,104,242,1,30,254,194,6,105,93,87,98,247,203,103,101,128,113,54,108,25,231,6,107,110,118,27,212,254,224,43,211,137,90,122,218,16,204,74,221,103,111,223,185,249,249,239,190,142,67,190,183,23,213,142,176,96,232,163,214,214,126,147,209,161,196,194,216,56,82,242,223,79,241,103,187,209,103,87,188,166,221,6,181,63,75,54,178,72,218,43,13,216,76,27,10,175,246,74,3,54,96,122,4,65,195,239,96,223,85,223,103,168,239,142,110,49,121,190,105,70,140,179,97,203,26,131,102,188,160,210,111,37,54,226,104,82,149,119,12,204,3,71,11,187,185,22,2,34,47,38,5,85,190,59,186,197,40,11,189,178,146,90,180,43,4,106,179,92,167,255,215,194,49,207,208,181,139,158,217,44,29,174,222,91,176,194,100,155,38,242,99,236,156,163,106,117,10,147,109,2,169,6,9,156,63,54,14,235,133,103,7,114,19,87,0,5,130,74,191,149,20,122,184,226,174,43,177,123,56,27,182,12,155,142,210,146,13,190,213,229,183,239,220,124,33,223,219,11,212,210,211,134,66,226,212,241,248,179,221,104,110,131,218,31,205,22,190,129,91,38,185,246,225,119,176,111,119,71,183,24,230,90,8,136,112,106,15,255,202,59,6,102,92,11,1,17,255,158,101,143,105,174,98,248,211,255,107,97,69,207,108,22,120,226,10,160,238,210,13,215,84,131,4,78,194,179,3,57,97,38,103,167,247,22,96,208,77,71,105,73,219,119,110,62,74,106,209,174,220,90,214,217,102,11,223,64,240,59,216,55,83,174,188,169,197,158,187,222,127,207,178,71,233,255,181,48,28,242,189,189,138,194,186,202,48,147,179,83,166,163,180,36,5,54,208,186,147,6,215,205,41,87,222,84,191,103,217,35,46,122,102,179,184,74,97,196,2,27,104,93,148,43,111,42,55,190,11,180,161,142,12,195,27,223,5,90,141,239,2,45,0,0,0,0,65,49,27,25,130,98,54,50,195,83,45,43,4,197,108,100,69,244,119,125,134,167,90,86,199,150,65,79,8,138,217,200,73,187,194,209,138,232,239,250,203,217,244,227,12,79,181,172,77,126,174,181,142,45,131,158,207,28,152,135,81,18,194,74,16,35,217,83,211,112,244,120,146,65,239,97,85,215,174,46,20,230,181,55,215,181,152,28,150,132,131,5,89,152,27,130,24,169,0,155,219,250,45,176,154,203,54,169,93,93,119,230,28,108,108,255,223,63,65,212,158,14,90,205,162,36,132,149,227,21,159,140,32,70,178,167,97,119,169,190,166,225,232,241,231,208,243,232,36,131,222,195,101,178,197,218,170,174,93,93,235,159,70,68,40,204,107,111,105,253,112,118,174,107,49,57,239,90,42,32,44,9,7,11,109,56,28,18,243,54,70,223,178,7,93,198,113,84,112,237,48,101,107,244,247,243,42,187,182,194,49,162,117,145,28,137,52,160,7,144,251,188,159,23,186,141,132,14,121,222,169,37,56,239,178,60,255,121,243,115,190,72,232,106,125,27,197,65,60,42,222,88,5,79,121,240,68,126,98,233,135,45,79,194,198,28,84,219,1,138,21,148,64,187,14,141,131,232,35,166,194,217,56,191,13,197,160,56,76,244,187,33,143,167,150,10,206,150,141,19,9,0,204,92,72,49,215,69,139,98,250,110,202,83,225,119,84,93,187,186,21,108,160,163,214,63,141,136,151,14,150,145,80,152,215,222,17,169,204,199,210,250,225,236,147,203,250,245,92,215,98,114,29,230,121,107,222,181,84,64,159,132,79,89,88,18,14,22,25,35,21,15,218,112,56,36,155,65,35,61,167,107,253,101,230,90,230,124,37,9,203,87,100,56,208,78,163,174,145,1,226,159,138,24,33,204,167,51,96,253,188,42,175,225,36,173,238,208,63,180,45,131,18,159,108,178,9,134,171,36,72,201,234,21,83,208,41,70,126,251,104,119,101,226,246,121,63,47,183,72,36,54,116,27,9,29,53,42,18,4,242,188,83,75,179,141,72,82,112,222,101,121,49,239,126,96,254,243,230,231,191,194,253,254,124,145,208,213,61,160,203,204,250,54,138,131,187,7,145,154,120,84,188,177,57,101,167,168,75,152,131,59,10,169,152,34,201,250,181,9,136,203,174,16,79,93,239,95,14,108,244,70,205,63,217,109,140,14,194,116,67,18,90,243,2,35,65,234,193,112,108,193,128,65,119,216,71,215,54,151,6,230,45,142,197,181,0,165,132,132,27,188,26,138,65,113,91,187,90,104,152,232,119,67,217,217,108,90,30,79,45,21,95,126,54,12,156,45,27,39,221,28,0,62,18,0,152,185,83,49,131,160,144,98,174,139,209,83,181,146,22,197,244,221,87,244,239,196,148,167,194,239,213,150,217,246,233,188,7,174,168,141,28,183,107,222,49,156,42,239,42,133,237,121,107,202,172,72,112,211,111,27,93,248,46,42,70,225,225,54,222,102,160,7,197,127,99,84,232,84,34,101,243,77,229,243,178,2,164,194,169,27,103,145,132,48,38,160,159,41,184,174,197,228,249,159,222,253,58,204,243,214,123,253,232,207,188,107,169,128,253,90,178,153,62,9,159,178,127,56,132,171,176,36,28,44,241,21,7,53,50,70,42,30,115,119,49,7,180,225,112,72,245,208,107,81,54,131,70,122,119,178,93,99,78,215,250,203,15,230,225,210,204,181,204,249,141,132,215,224,74,18,150,175,11,35,141,182,200,112,160,157,137,65,187,132,70,93,35,3,7,108,56,26,196,63,21,49,133,14,14,40,66,152,79,103,3,169,84,126,192,250,121,85,129,203,98,76,31,197,56,129,94,244,35,152,157,167,14,179,220,150,21,170,27,0,84,229,90,49,79,252,153,98,98,215,216,83,121,206,23,79,225,73,86,126,250,80,149,45,215,123,212,28,204,98,19,138,141,45,82,187,150,52,145,232,187,31,208,217,160,6,236,243,126,94,173,194,101,71,110,145,72,108,47,160,83,117,232,54,18,58,169,7,9,35,106,84,36,8,43,101,63,17,228,121,167,150,165,72,188,143,102,27,145,164,39,42,138,189,224,188,203,242,161,141,208,235,98,222,253,192,35,239,230,217,189,225,188,20,252,208,167,13,63,131,138,38,126,178,145,63,185,36,208,112,248,21,203,105,59,70,230,66,122,119,253,91,181,107,101,220,244,90,126,197,55,9,83,238,118,56,72,247,177,174,9,184,240,159,18,161,51,204,63,138,114,253,36,147,0,0,0,0,55,106,194,1,110,212,132,3,89,190,70,2,220,168,9,7,235,194,203,6,178,124,141,4,133,22,79,5,184,81,19,14,143,59,209,15,214,133,151,13,225,239,85,12,100,249,26,9,83,147,216,8,10,45,158,10,61,71,92,11,112,163,38,28,71,201,228,29,30,119,162,31,41,29,96,30,172,11,47,27,155,97,237,26,194,223,171,24,245,181,105,25,200,242,53,18,255,152,247,19,166,38,177,17,145,76,115,16,20,90,60,21,35,48,254,20,122,142,184,22,77,228,122,23,224,70,77,56,215,44,143,57,142,146,201,59,185,248,11,58,60,238,68,63,11,132,134,62,82,58,192,60,101,80,2,61,88,23,94,54,111,125,156,55,54,195,218,53,1,169,24,52,132,191,87,49,179,213,149,48,234,107,211,50,221,1,17,51,144,229,107,36,167,143,169,37,254,49,239,39,201,91,45,38,76,77,98,35,123,39,160,34,34,153,230,32,21,243,36,33,40,180,120,42,31,222,186,43,70,96,252,41,113,10,62,40,244,28,113,45,195,118,179,44,154,200,245,46,173,162,55,47,192,141,154,112,247,231,88,113,174,89,30,115,153,51,220,114,28,37,147,119,43,79,81,118,114,241,23,116,69,155,213,117,120,220,137,126,79,182,75,127,22,8,13,125,33,98,207,124,164,116,128,121,147,30,66,120,202,160,4,122,253,202,198,123,176,46,188,108,135,68,126,109,222,250,56,111,233,144,250,110,108,134,181,107,91,236,119,106,2,82,49,104,53,56,243,105,8,127,175,98,63,21,109,99,102,171,43,97,81,193,233,96,212,215,166,101,227,189,100,100,186,3,34,102,141,105,224,103,32,203,215,72,23,161,21,73,78,31,83,75,121,117,145,74,252,99,222,79,203,9,28,78,146,183,90,76,165,221,152,77,152,154,196,70,175,240,6,71,246,78,64,69,193,36,130,68,68,50,205,65,115,88,15,64,42,230,73,66,29,140,139,67,80,104,241,84,103,2,51,85,62,188,117,87,9,214,183,86,140,192,248,83,187,170,58,82,226,20,124,80,213,126,190,81,232,57,226,90,223,83,32,91,134,237,102,89,177,135,164,88,52,145,235,93,3,251,41,92,90,69,111,94,109,47,173,95,128,27,53,225,183,113,247,224,238,207,177,226,217,165,115,227,92,179,60,230,107,217,254,231,50,103,184,229,5,13,122,228,56,74,38,239,15,32,228,238,86,158,162,236,97,244,96,237,228,226,47,232,211,136,237,233,138,54,171,235,189,92,105,234,240,184,19,253,199,210,209,252,158,108,151,254,169,6,85,255,44,16,26,250,27,122,216,251,66,196,158,249,117,174,92,248,72,233,0,243,127,131,194,242,38,61,132,240,17,87,70,241,148,65,9,244,163,43,203,245,250,149,141,247,205,255,79,246,96,93,120,217,87,55,186,216,14,137,252,218,57,227,62,219,188,245,113,222,139,159,179,223,210,33,245,221,229,75,55,220,216,12,107,215,239,102,169,214,182,216,239,212,129,178,45,213,4,164,98,208,51,206,160,209,106,112,230,211,93,26,36,210,16,254,94,197,39,148,156,196,126,42,218,198,73,64,24,199,204,86,87,194,251,60,149,195,162,130,211,193,149,232,17,192,168,175,77,203,159,197,143,202,198,123,201,200,241,17,11,201,116,7,68,204,67,109,134,205,26,211,192,207,45,185,2,206,64,150,175,145,119,252,109,144,46,66,43,146,25,40,233,147,156,62,166,150,171,84,100,151,242,234,34,149,197,128,224,148,248,199,188,159,207,173,126,158,150,19,56,156,161,121,250,157,36,111,181,152,19,5,119,153,74,187,49,155,125,209,243,154,48,53,137,141,7,95,75,140,94,225,13,142,105,139,207,143,236,157,128,138,219,247,66,139,130,73,4,137,181,35,198,136,136,100,154,131,191,14,88,130,230,176,30,128,209,218,220,129,84,204,147,132,99,166,81,133,58,24,23,135,13,114,213,134,160,208,226,169,151,186,32,168,206,4,102,170,249,110,164,171,124,120,235,174,75,18,41,175,18,172,111,173,37,198,173,172,24,129,241,167,47,235,51,166,118,85,117,164,65,63,183,165,196,41,248,160,243,67,58,161,170,253,124,163,157,151,190,162,208,115,196,181,231,25,6,180,190,167,64,182,137,205,130,183,12,219,205,178,59,177,15,179,98,15,73,177,85,101,139,176,104,34,215,187,95,72,21,186,6,246,83,184,49,156,145,185,180,138,222,188,131,224,28,189,218,94,90,191,237,52,152,190,0,0,0,0,101,103,188,184,139,200,9,170,238,175,181,18,87,151,98,143,50,240,222,55,220,95,107,37,185,56,215,157,239,40,180,197,138,79,8,125,100,224,189,111,1,135,1,215,184,191,214,74,221,216,106,242,51,119,223,224,86,16,99,88,159,87,25,80,250,48,165,232,20,159,16,250,113,248,172,66,200,192,123,223,173,167,199,103,67,8,114,117,38,111,206,205,112,127,173,149,21,24,17,45,251,183,164,63,158,208,24,135,39,232,207,26,66,143,115,162,172,32,198,176,201,71,122,8,62,175,50,160,91,200,142,24,181,103,59,10,208,0,135,178,105,56,80,47,12,95,236,151,226,240,89,133,135,151,229,61,209,135,134,101,180,224,58,221,90,79,143,207,63,40,51,119,134,16,228,234,227,119,88,82,13,216,237,64,104,191,81,248,161,248,43,240,196,159,151,72,42,48,34,90,79,87,158,226,246,111,73,127,147,8,245,199,125,167,64,213,24,192,252,109,78,208,159,53,43,183,35,141,197,24,150,159,160,127,42,39,25,71,253,186,124,32,65,2,146,143,244,16,247,232,72,168,61,88,20,155,88,63,168,35,182,144,29,49,211,247,161,137,106,207,118,20,15,168,202,172,225,7,127,190,132,96,195,6,210,112,160,94,183,23,28,230,89,184,169,244,60,223,21,76,133,231,194,209,224,128,126,105,14,47,203,123,107,72,119,195,162,15,13,203,199,104,177,115,41,199,4,97,76,160,184,217,245,152,111,68,144,255,211,252,126,80,102,238,27,55,218,86,77,39,185,14,40,64,5,182,198,239,176,164,163,136,12,28,26,176,219,129,127,215,103,57,145,120,210,43,244,31,110,147,3,247,38,59,102,144,154,131,136,63,47,145,237,88,147,41,84,96,68,180,49,7,248,12,223,168,77,30,186,207,241,166,236,223,146,254,137,184,46,70,103,23,155,84,2,112,39,236,187,72,240,113,222,47,76,201,48,128,249,219,85,231,69,99,156,160,63,107,249,199,131,211,23,104,54,193,114,15,138,121,203,55,93,228,174,80,225,92,64,255,84,78,37,152,232,246,115,136,139,174,22,239,55,22,248,64,130,4,157,39,62,188,36,31,233,33,65,120,85,153,175,215,224,139,202,176,92,51,59,182,89,237,94,209,229,85,176,126,80,71,213,25,236,255,108,33,59,98,9,70,135,218,231,233,50,200,130,142,142,112,212,158,237,40,177,249,81,144,95,86,228,130,58,49,88,58,131,9,143,167,230,110,51,31,8,193,134,13,109,166,58,181,164,225,64,189,193,134,252,5,47,41,73,23,74,78,245,175,243,118,34,50,150,17,158,138,120,190,43,152,29,217,151,32,75,201,244,120,46,174,72,192,192,1,253,210,165,102,65,106,28,94,150,247,121,57,42,79,151,150,159,93,242,241,35,229,5,25,107,77,96,126,215,245,142,209,98,231,235,182,222,95,82,142,9,194,55,233,181,122,217,70,0,104,188,33,188,208,234,49,223,136,143,86,99,48,97,249,214,34,4,158,106,154,189,166,189,7,216,193,1,191,54,110,180,173,83,9,8,21,154,78,114,29,255,41,206,165,17,134,123,183,116,225,199,15,205,217,16,146,168,190,172,42,70,17,25,56,35,118,165,128,117,102,198,216,16,1,122,96,254,174,207,114,155,201,115,202,34,241,164,87,71,150,24,239,169,57,173,253,204,94,17,69,6,238,77,118,99,137,241,206,141,38,68,220,232,65,248,100,81,121,47,249,52,30,147,65,218,177,38,83,191,214,154,235,233,198,249,179,140,161,69,11,98,14,240,25,7,105,76,161,190,81,155,60,219,54,39,132,53,153,146,150,80,254,46,46,153,185,84,38,252,222,232,158,18,113,93,140,119,22,225,52,206,46,54,169,171,73,138,17,69,230,63,3,32,129,131,187,118,145,224,227,19,246,92,91,253,89,233,73,152,62,85,241,33,6,130,108,68,97,62,212,170,206,139,198,207,169,55,126,56,65,127,214,93,38,195,110,179,137,118,124,214,238,202,196,111,214,29,89,10,177,161,225,228,30,20,243,129,121,168,75,215,105,203,19,178,14,119,171,92,161,194,185,57,198,126,1,128,254,169,156,229,153,21,36,11,54,160,54,110,81,28,142,167,22,102,134,194,113,218,62,44,222,111,44,73,185,211,148,240,129,4,9,149,230,184,177,123,73,13,163,30,46,177,27,72,62,210,67,45,89,110,251,195,246,219,233,166,145,103,81,31,169,176,204,122,206,12,116,148,97,185,102,241,6,5,222,0,0,0,0,119,7,48,150,238,14,97,44,153,9,81,186,7,109,196,25,112,106,244,143,233,99,165,53,158,100,149,163,14,219,136,50,121,220,184,164,224,213,233,30,151,210,217,136,9,182,76,43,126,177,124,189,231,184,45,7,144,191,29,145,29,183,16,100,106,176,32,242,243,185,113,72,132,190,65,222,26,218,212,125,109,221,228,235,244,212,181,81,131,211,133,199,19,108,152,86,100,107,168,192,253,98,249,122,138,101,201,236,20,1,92,79,99,6,108,217,250,15,61,99,141,8,13,245,59,110,32,200,76,105,16,94,213,96,65,228,162,103,113,114,60,3,228,209,75,4,212,71,210,13,133,253,165,10,181,107,53,181,168,250,66,178,152,108,219,187,201,214,172,188,249,64,50,216,108,227,69,223,92,117,220,214,13,207,171,209,61,89,38,217,48,172,81,222,0,58,200,215,81,128,191,208,97,22,33,180,244,181,86,179,196,35,207,186,149,153,184,189,165,15,40,2,184,158,95,5,136,8,198,12,217,178,177,11,233,36,47,111,124,135,88,104,76,17,193,97,29,171,182,102,45,61,118,220,65,144,1,219,113,6,152,210,32,188,239,213,16,42,113,177,133,137,6,182,181,31,159,191,228,165,232,184,212,51,120,7,201,162,15,0,249,52,150,9,168,142,225,14,152,24,127,106,13,187,8,109,61,45,145,100,108,151,230,99,92,1,107,107,81,244,28,108,97,98,133,101,48,216,242,98,0,78,108,6,149,237,27,1,165,123,130,8,244,193,245,15,196,87,101,176,217,198,18,183,233,80,139,190,184,234,252,185,136,124,98,221,29,223,21,218,45,73,140,211,124,243,251,212,76,101,77,178,97,88,58,181,81,206,163,188,0,116,212,187,48,226,74,223,165,65,61,216,149,215,164,209,196,109,211,214,244,251,67,105,233,106,52,110,217,252,173,103,136,70,218,96,184,208,68,4,45,115,51,3,29,229,170,10,76,95,221,13,124,201,80,5,113,60,39,2,65,170,190,11,16,16,201,12,32,134,87,104,181,37,32,111,133,179,185,102,212,9,206,97,228,159,94,222,249,14,41,217,201,152,176,208,152,34,199,215,168,180,89,179,61,23,46,180,13,129,183,189,92,59,192,186,108,173,237,184,131,32,154,191,179,182,3,182,226,12,116,177,210,154,234,213,71,57,157,210,119,175,4,219,38,21,115,220,22,131,227,99,11,18,148,100,59,132,13,109,106,62,122,106,90,168,228,14,207,11,147,9,255,157,10,0,174,39,125,7,158,177,240,15,147,68,135,8,163,210,30,1,242,104,105,6,194,254,247,98,87,93,128,101,103,203,25,108,54,113,110,107,6,231,254,212,27,118,137,211,43,224,16,218,122,90,103,221,74,204,249,185,223,111,142,190,239,249,23,183,190,67,96,176,142,213,214,214,163,232,161,209,147,126,56,216,194,196,79,223,242,82,209,187,103,241,166,188,87,103,63,181,6,221,72,178,54,75,216,13,43,218,175,10,27,76,54,3,74,246,65,4,122,96,223,96,239,195,168,103,223,85,49,110,142,239,70,105,190,121,203,97,179,140,188,102,131,26,37,111,210,160,82,104,226,54,204,12,119,149,187,11,71,3,34,2,22,185,85,5,38,47,197,186,59,190,178,189,11,40,43,180,90,146,92,179,106,4,194,215,255,167,181,208,207,49,44,217,158,139,91,222,174,29,155,100,194,176,236,99,242,38,117,106,163,156,2,109,147,10,156,9,6,169,235,14,54,63,114,7,103,133,5,0,87,19,149,191,74,130,226,184,122,20,123,177,43,174,12,182,27,56,146,210,142,155,229,213,190,13,124,220,239,183,11,219,223,33,134,211,210,212,241,212,226,66,104,221,179,248,31,218,131,110,129,190,22,205,246,185,38,91,111,176,119,225,24,183,71,119,136,8,90,230,255,15,106,112,102,6,59,202,17,1,11,92,143,101,158,255,248,98,174,105,97,107,255,211,22,108,207,69,160,10,226,120,215,13,210,238,78,4,131,84,57,3,179,194,167,103,38,97,208,96,22,247,73,105,71,77,62,110,119,219,174,209,106,74,217,214,90,220,64,223,11,102,55,216,59,240,169,188,174,83,222,187,158,197,71,178,207,127,48,181,255,233,189,189,242,28,202,186,194,138,83,179,147,48,36,180,163,166,186,208,54,5,205,215,6,147,84,222,87,41,35,217,103,191,179,102,122,46,196,97,74,184,93,104,27,2,42,111,43,148,180,11,190,55,195,12,142,161,90,5,223,27,45,2,239,141,0,0,0,0,25,27,49,65,50,54,98,130,43,45,83,195,100,108,197,4,125,119,244,69,86,90,167,134,79,65,150,199,200,217,138,8,209,194,187,73,250,239,232,138,227,244,217,203,172,181,79,12,181,174,126,77,158,131,45,142,135,152,28,207,74,194,18,81,83,217,35,16,120,244,112,211,97,239,65,146,46,174,215,85,55,181,230,20,28,152,181,215,5,131,132,150,130,27,152,89,155,0,169,24,176,45,250,219,169,54,203,154,230,119,93,93,255,108,108,28,212,65,63,223,205,90,14,158,149,132,36,162,140,159,21,227,167,178,70,32,190,169,119,97,241,232,225,166,232,243,208,231,195,222,131,36,218,197,178,101,93,93,174,170,68,70,159,235,111,107,204,40,118,112,253,105,57,49,107,174,32,42,90,239,11,7,9,44,18,28,56,109,223,70,54,243,198,93,7,178,237,112,84,113,244,107,101,48,187,42,243,247,162,49,194,182,137,28,145,117,144,7,160,52,23,159,188,251,14,132,141,186,37,169,222,121,60,178,239,56,115,243,121,255,106,232,72,190,65,197,27,125,88,222,42,60,240,121,79,5,233,98,126,68,194,79,45,135,219,84,28,198,148,21,138,1,141,14,187,64,166,35,232,131,191,56,217,194,56,160,197,13,33,187,244,76,10,150,167,143,19,141,150,206,92,204,0,9,69,215,49,72,110,250,98,139,119,225,83,202,186,187,93,84,163,160,108,21,136,141,63,214,145,150,14,151,222,215,152,80,199,204,169,17,236,225,250,210,245,250,203,147,114,98,215,92,107,121,230,29,64,84,181,222,89,79,132,159,22,14,18,88,15,21,35,25,36,56,112,218,61,35,65,155,101,253,107,167,124,230,90,230,87,203,9,37,78,208,56,100,1,145,174,163,24,138,159,226,51,167,204,33,42,188,253,96,173,36,225,175,180,63,208,238,159,18,131,45,134,9,178,108,201,72,36,171,208,83,21,234,251,126,70,41,226,101,119,104,47,63,121,246,54,36,72,183,29,9,27,116,4,18,42,53,75,83,188,242,82,72,141,179,121,101,222,112,96,126,239,49,231,230,243,254,254,253,194,191,213,208,145,124,204,203,160,61,131,138,54,250,154,145,7,187,177,188,84,120,168,167,101,57,59,131,152,75,34,152,169,10,9,181,250,201,16,174,203,136,95,239,93,79,70,244,108,14,109,217,63,205,116,194,14,140,243,90,18,67,234,65,35,2,193,108,112,193,216,119,65,128,151,54,215,71,142,45,230,6,165,0,181,197,188,27,132,132,113,65,138,26,104,90,187,91,67,119,232,152,90,108,217,217,21,45,79,30,12,54,126,95,39,27,45,156,62,0,28,221,185,152,0,18,160,131,49,83,139,174,98,144,146,181,83,209,221,244,197,22,196,239,244,87,239,194,167,148,246,217,150,213,174,7,188,233,183,28,141,168,156,49,222,107,133,42,239,42,202,107,121,237,211,112,72,172,248,93,27,111,225,70,42,46,102,222,54,225,127,197,7,160,84,232,84,99,77,243,101,34,2,178,243,229,27,169,194,164,48,132,145,103,41,159,160,38,228,197,174,184,253,222,159,249,214,243,204,58,207,232,253,123,128,169,107,188,153,178,90,253,178,159,9,62,171,132,56,127,44,28,36,176,53,7,21,241,30,42,70,50,7,49,119,115,72,112,225,180,81,107,208,245,122,70,131,54,99,93,178,119,203,250,215,78,210,225,230,15,249,204,181,204,224,215,132,141,175,150,18,74,182,141,35,11,157,160,112,200,132,187,65,137,3,35,93,70,26,56,108,7,49,21,63,196,40,14,14,133,103,79,152,66,126,84,169,3,85,121,250,192,76,98,203,129,129,56,197,31,152,35,244,94,179,14,167,157,170,21,150,220,229,84,0,27,252,79,49,90,215,98,98,153,206,121,83,216,73,225,79,23,80,250,126,86,123,215,45,149,98,204,28,212,45,141,138,19,52,150,187,82,31,187,232,145,6,160,217,208,94,126,243,236,71,101,194,173,108,72,145,110,117,83,160,47,58,18,54,232,35,9,7,169,8,36,84,106,17,63,101,43,150,167,121,228,143,188,72,165,164,145,27,102,189,138,42,39,242,203,188,224,235,208,141,161,192,253,222,98,217,230,239,35,20,188,225,189,13,167,208,252,38,138,131,63,63,145,178,126,112,208,36,185,105,203,21,248,66,230,70,59,91,253,119,122,220,101,107,181,197,126,90,244,238,83,9,55,247,72,56,118,184,9,174,177,161,18,159,240,138,63,204,51,147,36,253,114,0,0,0,0,1,194,106,55,3,132,212,110,2,70,190,89,7,9,168,220,6,203,194,235,4,141,124,178,5,79,22,133,14,19,81,184,15,209,59,143,13,151,133,214,12,85,239,225,9,26,249,100,8,216,147,83,10,158,45,10,11,92,71,61,28,38,163,112,29,228,201,71,31,162,119,30,30,96,29,41,27,47,11,172,26,237,97,155,24,171,223,194,25,105,181,245,18,53,242,200,19,247,152,255,17,177,38,166,16,115,76,145,21,60,90,20,20,254,48,35,22,184,142,122,23,122,228,77,56,77,70,224,57,143,44,215,59,201,146,142,58,11,248,185,63,68,238,60,62,134,132,11,60,192,58,82,61,2,80,101,54,94,23,88,55,156,125,111,53,218,195,54,52,24,169,1,49,87,191,132,48,149,213,179,50,211,107,234,51,17,1,221,36,107,229,144,37,169,143,167,39,239,49,254,38,45,91,201,35,98,77,76,34,160,39,123,32,230,153,34,33,36,243,21,42,120,180,40,43,186,222,31,41,252,96,70,40,62,10,113,45,113,28,244,44,179,118,195,46,245,200,154,47,55,162,173,112,154,141,192,113,88,231,247,115,30,89,174,114,220,51,153,119,147,37,28,118,81,79,43,116,23,241,114,117,213,155,69,126,137,220,120,127,75,182,79,125,13,8,22,124,207,98,33,121,128,116,164,120,66,30,147,122,4,160,202,123,198,202,253,108,188,46,176,109,126,68,135,111,56,250,222,110,250,144,233,107,181,134,108,106,119,236,91,104,49,82,2,105,243,56,53,98,175,127,8,99,109,21,63,97,43,171,102,96,233,193,81,101,166,215,212,100,100,189,227,102,34,3,186,103,224,105,141,72,215,203,32,73,21,161,23,75,83,31,78,74,145,117,121,79,222,99,252,78,28,9,203,76,90,183,146,77,152,221,165,70,196,154,152,71,6,240,175,69,64,78,246,68,130,36,193,65,205,50,68,64,15,88,115,66,73,230,42,67,139,140,29,84,241,104,80,85,51,2,103,87,117,188,62,86,183,214,9,83,248,192,140,82,58,170,187,80,124,20,226,81,190,126,213,90,226,57,232,91,32,83,223,89,102,237,134,88,164,135,177,93,235,145,52,92,41,251,3,94,111,69,90,95,173,47,109,225,53,27,128,224,247,113,183,226,177,207,238,227,115,165,217,230,60,179,92,231,254,217,107,229,184,103,50,228,122,13,5,239,38,74,56,238,228,32,15,236,162,158,86,237,96,244,97,232,47,226,228,233,237,136,211,235,171,54,138,234,105,92,189,253,19,184,240,252,209,210,199,254,151,108,158,255,85,6,169,250,26,16,44,251,216,122,27,249,158,196,66,248,92,174,117,243,0,233,72,242,194,131,127,240,132,61,38,241,70,87,17,244,9,65,148,245,203,43,163,247,141,149,250,246,79,255,205,217,120,93,96,216,186,55,87,218,252,137,14,219,62,227,57,222,113,245,188,223,179,159,139,221,245,33,210,220,55,75,229,215,107,12,216,214,169,102,239,212,239,216,182,213,45,178,129,208,98,164,4,209,160,206,51,211,230,112,106,210,36,26,93,197,94,254,16,196,156,148,39,198,218,42,126,199,24,64,73,194,87,86,204,195,149,60,251,193,211,130,162,192,17,232,149,203,77,175,168,202,143,197,159,200,201,123,198,201,11,17,241,204,68,7,116,205,134,109,67,207,192,211,26,206,2,185,45,145,175,150,64,144,109,252,119,146,43,66,46,147,233,40,25,150,166,62,156,151,100,84,171,149,34,234,242,148,224,128,197,159,188,199,248,158,126,173,207,156,56,19,150,157,250,121,161,152,181,111,36,153,119,5,19,155,49,187,74,154,243,209,125,141,137,53,48,140,75,95,7,142,13,225,94,143,207,139,105,138,128,157,236,139,66,247,219,137,4,73,130,136,198,35,181,131,154,100,136,130,88,14,191,128,30,176,230,129,220,218,209,132,147,204,84,133,81,166,99,135,23,24,58,134,213,114,13,169,226,208,160,168,32,186,151,170,102,4,206,171,164,110,249,174,235,120,124,175,41,18,75,173,111,172,18,172,173,198,37,167,241,129,24,166,51,235,47,164,117,85,118,165,183,63,65,160,248,41,196,161,58,67,243,163,124,253,170,162,190,151,157,181,196,115,208,180,6,25,231,182,64,167,190,183,130,205,137,178,205,219,12,179,15,177,59,177,73,15,98,176,139,101,85,187,215,34,104,186,21,72,95,184,83,246,6,185,145,156,49,188,222,138,180,189,28,224,131,191,90,94,218,190,152,52,237,0,0,0,0,184,188,103,101,170,9,200,139,18,181,175,238,143,98,151,87,55,222,240,50,37,107,95,220,157,215,56,185,197,180,40,239,125,8,79,138,111,189,224,100,215,1,135,1,74,214,191,184,242,106,216,221,224,223,119,51,88,99,16,86,80,25,87,159,232,165,48,250,250,16,159,20,66,172,248,113,223,123,192,200,103,199,167,173,117,114,8,67,205,206,111,38,149,173,127,112,45,17,24,21,63,164,183,251,135,24,208,158,26,207,232,39,162,115,143,66,176,198,32,172,8,122,71,201,160,50,175,62,24,142,200,91,10,59,103,181,178,135,0,208,47,80,56,105,151,236,95,12,133,89,240,226,61,229,151,135,101,134,135,209,221,58,224,180,207,143,79,90,119,51,40,63,234,228,16,134,82,88,119,227,64,237,216,13,248,81,191,104,240,43,248,161,72,151,159,196,90,34,48,42,226,158,87,79,127,73,111,246,199,245,8,147,213,64,167,125,109,252,192,24,53,159,208,78,141,35,183,43,159,150,24,197,39,42,127,160,186,253,71,25,2,65,32,124], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([16,244,143,146,168,72,232,247,155,20,88,61,35,168,63,88,49,29,144,182,137,161,247,211,20,118,207,106,172,202,168,15,190,127,7,225,6,195,96,132,94,160,112,210,230,28,23,183,244,169,184,89,76,21,223,60,209,194,231,133,105,126,128,224,123,203,47,14,195,119,72,107,203,13,15,162,115,177,104,199,97,4,199,41,217,184,160,76,68,111,152,245,252,211,255,144,238,102,80,126,86,218,55,27,14,185,39,77,182,5,64,40,164,176,239,198,28,12,136,163,129,219,176,26,57,103,215,127,43,210,120,145,147,110,31,244,59,38,247,3,131,154,144,102,145,47,63,136,41,147,88,237,180,68,96,84,12,248,7,49,30,77,168,223,166,241,207,186,254,146,223,236,70,46,184,137,84,155,23,103,236,39,112,2,113,240,72,187,201,76,47,222,219,249,128,48,99,69,231,85,107,63,160,156,211,131,199,249,193,54,104,23,121,138,15,114,228,93,55,203,92,225,80,174,78,84,255,64,246,232,152,37,174,139,136,115,22,55,239,22,4,130,64,248,188,62,39,157,33,233,31,36,153,85,120,65,139,224,215,175,51,92,176,202,237,89,182,59,85,229,209,94,71,80,126,176,255,236,25,213,98,59,33,108,218,135,70,9,200,50,233,231,112,142,142,130,40,237,158,212,144,81,249,177,130,228,86,95,58,88,49,58,167,143,9,131,31,51,110,230,13,134,193,8,181,58,166,109,189,64,225,164,5,252,134,193,23,73,41,47,175,245,78,74,50,34,118,243,138,158,17,150,152,43,190,120,32,151,217,29,120,244,201,75,192,72,174,46,210,253,1,192,106,65,102,165,247,150,94,28,79,42,57,121,93,159,150,151,229,35,241,242,77,107,25,5,245,215,126,96,231,98,209,142,95,222,182,235,194,9,142,82,122,181,233,55,104,0,70,217,208,188,33,188,136,223,49,234,48,99,86,143,34,214,249,97,154,106,158,4,7,189,166,189,191,1,193,216,173,180,110,54,21,8,9,83,29,114,78,154,165,206,41,255,183,123,134,17,15,199,225,116,146,16,217,205,42,172,190,168,56,25,17,70,128,165,118,35,216,198,102,117,96,122,1,16,114,207,174,254,202,115,201,155,87,164,241,34,239,24,150,71,253,173,57,169,69,17,94,204,118,77,238,6,206,241,137,99,220,68,38,141,100,248,65,232,249,47,121,81,65,147,30,52,83,38,177,218,235,154,214,191,179,249,198,233,11,69,161,140,25,240,14,98,161,76,105,7,60,155,81,190,132,39,54,219,150,146,153,53,46,46,254,80,38,84,185,153,158,232,222,252,140,93,113,18,52,225,22,119,169,54,46,206,17,138,73,171,3,63,230,69,187,131,129,32,227,224,145,118,91,92,246,19,73,233,89,253,241,85,62,152,108,130,6,33,212,62,97,68,198,139,206,170,126,55,169,207,214,127,65,56,110,195,38,93,124,118,137,179,196,202,238,214,89,29,214,111,225,161,177,10,243,20,30,228,75,168,121,129,19,203,105,215,171,119,14,178,185,194,161,92,1,126,198,57,156,169,254,128,36,21,153,229,54,160,54,11,142,28,81,110,134,102,22,167,62,218,113,194,44,111,222,44,148,211,185,73,9,4,129,240,177,184,230,149,163,13,73,123,27,177,46,30,67,210,62,72,251,110,89,45,233,219,246,195,81,103,145,166,204,176,169,31,116,12,206,122,102,185,97,148,222,5,6,241,0,0,0,0,0,0,0,0,24,0,0,0,4,0,4,0,8,0,4,0,38,0,0,0,4,0,5,0,16,0,8,0,38,0,0,0,4,0,6,0,32,0,32,0,38,0,0,0,4,0,4,0,16,0,16,0,44,0,0,0,8,0,16,0,32,0,32,0,44,0,0,0,8,0,16,0,128,0,128,0,44,0,0,0,8,0,32,0,128,0,0,1,44,0,0,0,32,0,128,0,2,1,0,4,44,0,0,0,32,0,2,1,2,1,0,16,44,0,0,0,16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,10,0,0,0,12,0,0,0,14,0,0,0,16,0,0,0,20,0,0,0,24,0,0,0,28,0,0,0,32,0,0,0,40,0,0,0,48,0,0,0,56,0,0,0,64,0,0,0,80,0,0,0,96,0,0,0,112,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,48,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,192,0,0,0,0,1,0,0,128,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,48,0,0,0,64,0,0,0,96,0,0,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,73,110,118,97,108,105,100,32,98,105,116,32,100,101,112,116,104,32,105,110,32,73,72,68,82,0,0,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,73,110,118,97,108,105,100,32,99,72,82,77,32,119,104,105,116,101,32,112,111,105,110,116,0,0,0,0,0,0,0,0,49,46,50,46,51,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,84,104,105,115,32,99,111,110,118,101,114,116,101,114,32,119,97,115,32,109,97,100,101,32,116,111,32,99,111,110,118,101,114,116,32,80,86,82,45,88,32,116,101,120,116,117,114,101,32,102,105,108,101,115,32,116,111,32,116,104,101,32,80,78,71,32,102,111,114,109,97,116,46,32,73,116,32,0,0,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,105,110,99,111,109,112,97,116,105,98,108,101,32,118,101,114,115,105,111,110,0,0,0,0,77,97,114,99,104,0,0,0,73,110,118,97,108,105,100,32,105,110,116,101,114,108,97,99,101,32,116,121,112,101,32,115,112,101,99,105,102,105,101,100,0,0,0,0,0,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,87,105,100,116,104,32,105,115,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,108,105,98,112,110,103,32,116,111,32,112,114,111,99,101,115,115,32,112,105,120,101,108,115,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,105,109,97,103,101,32,115,105,122,101,32,105,110,32,73,72,68,82,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,98,117,102,102,101,114,32,101,114,114,111,114,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,73,103,110,111,114,105,110,103,32,97,116,116,101,109,112,116,32,116,111,32,115,101,116,32,110,101,103,97,116,105,118,101,32,99,104,114,111,109,97,116,105,99,105,116,121,32,118,97,108,117,101,0,0,0,0,0,73,110,118,97,108,105,100,32,102,105,108,116,101,114,32,116,121,112,101,32,115,112,101,99,105,102,105,101,100,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,73,110,99,111,109,112,97,116,105,98,108,101,32,108,105,98,112,110,103,32,118,101,114,115,105,111,110,32,105,110,32,97,112,112,108,105,99,97,116,105,111,110,32,97,110,100,32,108,105,98,114,97,114,121,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,112,110,103,32,105,110,102,111,32,115,116,114,117,99,116,115,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,112,110,103,32,114,101,97,100,32,115,116,114,117,99,116,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,105,109,97,103,101,32,115,105,122,101,32,101,120,99,101,101,100,115,32,117,115,101,114,32,108,105,109,105,116,115,32,105,110,32,73,72,68,82,0,0,49,46,50,46,51,57,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,68,111,110,101,46,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,105,110,115,117,102,102,105,99,105,101,110,116,32,109,101,109,111,114,121,0,0,0,0,0,34,32,102,111,114,32,119,114,105,116,105,110,103,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,119,98,0,0,0,0,0,0,73,110,118,97,108,105,100,32,99,111,109,112,114,101,115,115,105,111,110,32,116,121,112,101,32,115,112,101,99,105,102,105,101,100,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,67,111,110,118,101,114,116,105,110,103,46,46,46,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,80,105,120,101,108,32,70,111,114,109,97,116,32,58,32,0,65,112,112,108,105,99,97,116,105,111,110,32,32,105,115,32,32,114,117,110,110,105,110,103,32,119,105,116,104,32,112,110,103,46,99,32,102,114,111,109,32,108,105,98,112,110,103,45,37,46,50,48,115,0,0,0,68,97,116,97,32,83,105,122,101,32,32,32,32,58,32,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,120,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,73,109,97,103,101,32,83,105,122,101,32,32,32,58,32,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,71,108,111,98,97,108,32,73,110,100,101,120,32,58,32,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,73,109,97,103,101,32,119,105,100,116,104,32,111,114,32,104,101,105,103,104,116,32,105,115,32,122,101,114,111,32,105,110,32,73,72,68,82,0,0,0,70,105,108,101,32,70,111,114,109,97,116,32,32,58,32,0,79,117,116,112,117,116,32,70,105,108,101,32,32,58,32,0,80,77,0,0,0,0,0,0,100,97,116,97,32,101,114,114,111,114,0,0,0,0,0,0,73,110,112,117,116,32,70,105,108,101,32,32,32,58,32,0,110,101,101,100,32,100,105,99,116,105,111,110,97,114,121,0,65,77,0,0,0,0,0,0,85,110,99,111,109,112,114,101,115,115,101,100,0,0,0,0,73,110,118,97,108,105,100,32,105,109,97,103,101,32,99,111,108,111,114,32,116,121,112,101,32,115,112,101,99,105,102,105,101,100,0,0,0,0,0,0,68,88,84,53,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,108,105,98,112,110,103,32,101,114,114,111,114,58,32,37,115,0,0,0,0,0,0,0,0,68,88,84,51,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,112,112,108,105,99,97,116,105,111,110,32,119,97,115,32,99,111,109,112,105,108,101,100,32,119,105,116,104,32,112,110,103,46,104,32,102,114,111,109,32,108,105,98,112,110,103,45,37,46,50,48,115,0,0,0,68,88,84,49,0,0,0,0,115,111,114,114,121,44,32,116,104,105,115,32,68,68,83,32,99,111,109,112,114,101,115,115,105,111,110,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,67,97,108,108,32,116,111,32,78,85,76,76,32,119,114,105,116,101,32,102,117,110,99,116,105,111,110,0,0,0,0,0,83,111,114,114,121,44,32,116,104,105,115,32,102,105,108,101,32,105,115,32,97,32,114,101,97,108,32,68,114,101,97,109,99,97,115,116,32,80,111,119,101,114,86,82,32,40,80,86,82,41,32,102,105,108,101,32,33,0,0,0,0,0,0,0,83,111,114,114,121,44,32,117,110,97,98,108,101,32,116,111,32,114,101,97,100,32,102,105,108,101,32,115,105,103,110,97,116,117,114,101,0,0,0,0,34,41,0,0,0,0,0,0,34,32,105,110,115,116,101,97,100,32,111,102,32,34,0,0,115,116,114,101,97,109,32,101,114,114,111,114,0,0,0,0,85,110,107,110,111,119,110,32,99,111,109,112,114,101,115,115,105,111,110,32,116,121,112,101,32,37,100,0,0,0,0,0,83,111,114,114,121,44,32,105,110,118,97,108,105,100,32,115,105,103,110,97,116,117,114,101,32,40,102,111,117,110,100,58,32,34,0,0,0,0,0,0,122,108,105,98,32,101,114,114,111,114,0,0,0,0,0,0,71,66,73,88,32,47,32,80,86,82,45,88,0,0,0,0,73,110,118,97,108,105,100,32,98,105,116,32,100,101,112,116,104,32,102,111,114,32,82,71,66,65,32,105,109,97,103,101,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,116,105,109,101,32,115,112,101,99,105,102,105,101,100,32,102,111,114,32,116,73,77,69,32,99,104,117,110,107,0,0,0,71,66,73,88,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,117,110,105,116,32,116,121,112,101,32,102,111,114,32,112,72,89,115,32,99,104,117,110,107,0,0,0,108,105,98,112,110,103,32,101,114,114,111,114,58,32,37,115,44,32,111,102,102,115,101,116,61,37,100,0,0,0,0,0,80,86,82,45,88,0,0,0,78,111,32,73,68,65,84,115,32,119,114,105,116,116,101,110,32,105,110,116,111,32,102,105,108,101,0,0,0,0,0,0,37,49,50,46,49,50,101,0,80,86,82,84,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,101,113,117,97,116,105,111,110,32,116,121,112,101,32,102,111,114,32,112,67,65,76,32,99,104,117,110,107,0,0,0,0,0,0,0,68,68,83,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,117,110,105,116,32,116,121,112,101,32,102,111,114,32,111,70,70,115,32,99,104,117,110,107,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,73,110,118,97,108,105,100,32,98,105,116,32,100,101,112,116,104,32,102,111,114,32,103,114,97,121,115,99,97,108,101,32,105,109,97,103,101,0,0,0,68,68,83,32,0,0,0,0,107,101,121,119,111,114,100,32,108,101,110,103,116,104,32,109,117,115,116,32,98,101,32,49,32,45,32,55,57,32,99,104,97,114,97,99,116,101,114,115,0,0,0,0,0,0,0,0,40,85,110,100,101,102,41,0,90,101,114,111,32,108,101,110,103,116,104,32,107,101,121,119,111,114,100,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,101,120,116,114,97,32,105,110,116,101,114,105,111,114,32,115,112,97,99,101,115,32,114,101,109,111,118,101,100,32,102,114,111,109,32,107,101,121,119,111,114,100,0,0,0,0,0,0,69,114,114,111,114,58,32,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,102,105,108,101,32,101,114,114,111,114,0,0,0,0,0,0,108,101,97,100,105,110,103,32,115,112,97,99,101,115,32,114,101,109,111,118,101,100,32,102,114,111,109,32,107,101,121,119,111,114,100,0,0,0,0,0,116,104,101,32,115,97,109,101,32,115,116,114,117,99,116,117,114,101,46,32,32,82,101,115,101,116,116,105,110,103,32,114,101,97,100,95,100,97,116,97,95,102,110,32,116,111,32,78,85,76,76,46,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,116,114,97,105,108,105,110,103,32,115,112,97,99,101,115,32,114,101,109,111,118,101,100,32,102,114,111,109,32,107,101,121,119,111,114,100,0,0,0,0,69,114,114,111,114,58,32,85,110,101,120,112,101,99,116,101,100,32,97,114,103,117,109,101,110,116,32,34,0,0,0,0,73,110,118,97,108,105,100,32,98,105,116,32,100,101,112,116,104,32,102,111,114,32,103,114,97,121,115,99,97,108,101,43,97,108,112,104,97,32,105,109,97,103,101,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,107,101,121,119,111,114,100,32,99,104,97,114,97,99,116,101,114,32,48,120,37,48,50,88,0,0,0,0,0,0,0,0,34,46,0,0,0,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,32,119,104,105,108,101,32,112,114,111,99,101,115,105,110,103,32,107,101,121,119,111,114,100,0,0,0,108,105,98,112,110,103,32,101,114,114,111,114,32,110,111,46,32,37,115,58,32,37,115,0,69,114,114,111,114,58,32,85,110,107,110,111,119,110,32,111,112,116,105,111,110,32,34,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,119,114,105,116,101,32,105,110,116,101,114,110,97,116,105,111,110,97,108,32,116,101,120,116,0,0,0,0,0,0,122,101,114,111,32,108,101,110,103,116,104,32,107,101,121,119,111,114,100,0,0,0,0,0,104,116,116,112,58,47,47,115,98,105,98,117,105,108,100,101,114,46,115,104,111,114,116,117,114,108,46,99,111,109,47,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,110,117,109,98,101,114,32,111,102,32,104,105,115,116,111,103,114,97,109,32,101,110,116,114,105,101,115,32,115,112,101,99,105,102,105,101,100,0,0,0,41,32,45,32,40,67,41,114,101,97,116,101,100,32,98,121,32,91,98,105,103,95,102,117,114,121,93,83,105,90,105,79,85,83,0,0,0,0,0,0,73,103,110,111,114,105,110,103,32,97,116,116,101,109,112,116,32,116,111,32,119,114,105,116,101,32,98,75,71,68,32,99,104,117,110,107,32,111,117,116,45,111,102,45,114,97,110,103,101,32,102,111,114,32,98,105,116,95,100,101,112,116,104,0,79,99,116,32,49,49,32,50,48,49,52,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,73,103,110,111,114,105,110,103,32,97,116,116,101,109,112,116,32,116,111,32,119,114,105,116,101,32,49,54,45,98,105,116,32,98,75,71,68,32,99,104,117,110,107,32,119,104,101,110,32,98,105,116,95,100,101,112,116,104,32,105,115,32,56,0,32,40,0,0,0,0,0,0,37,112,0,0,0,0,0,0,73,110,118,97,108,105,100,32,98,97,99,107,103,114,111,117,110,100,32,112,97,108,101,116,116,101,32,105,110,100,101,120,0,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,48,46,49,0,0,0,0,0,67,97,110,39,116,32,119,114,105,116,101,32,116,82,78,83,32,119,105,116,104,32,97,110,32,97,108,112,104,97,32,99,104,97,110,110,101,108,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,80,86,82,88,50,80,78,71,32,45,32,86,101,114,115,105,111,110,32,0,0,0,0,0,73,103,110,111,114,105,110,103,32,97,116,116,101,109,112,116,32,116,111,32,119,114,105,116,101,32,49,54,45,98,105,116,32,116,82,78,83,32,99,104,117,110,107,32,119,104,101,110,32,98,105,116,95,100,101,112,116,104,32,105,115,32,56,0,116,114,117,101,0,0,0,0,32,32,32,32,84,104,105,115,32,119,105,108,108,32,100,101,99,111,100,101,32,34,115,105,122,105,111,117,115,46,112,118,114,34,32,98,117,116,32,102,111,114,99,101,32,116,104,101,32,117,115,101,32,111,102,32,116,104,101,32,68,88,84,49,32,97,108,103,111,114,105,116,104,109,46,0,0,0,0,0,65,116,116,101,109,112,116,101,100,32,116,111,32,115,101,116,32,98,111,116,104,32,114,101,97,100,95,100,97,116,97,95,102,110,32,97,110,100,32,119,114,105,116,101,95,100,97,116,97,95,102,110,32,105,110,0,73,103,110,111,114,105,110,103,32,97,116,116,101,109,112,116,32,116,111,32,119,114,105,116,101,32,116,82,78,83,32,99,104,117,110,107,32,111,117,116,45,111,102,45,114,97,110,103,101,32,102,111,114,32,98,105,116,95,100,101,112,116,104,0,58,32,0,0,0,0,0,0,32,45,49,32,115,105,122,105,111,117,115,46,112,118,114,0,73,110,118,97,108,105,100,32,98,105,116,32,100,101,112,116,104,32,102,111,114,32,112,97,108,101,116,116,101,100,32,105,109,97,103,101,0,0,0,0,73,110,118,97,108,105,100,32,110,117,109,98,101,114,32,111,102,32,116,114,97,110,115,112,97,114,101,110,116,32,99,111,108,111,114,115,32,115,112,101,99,105,102,105,101,100,0,0,32,32,32,32,84,104,105,115,32,119,105,108,108,32,100,101,99,111,100,101,32,34,98,105,103,95,102,117,114,121,46,112,118,114,34,32,97,110,100,32,119,114,105,116,101,32,116,104,101,32,111,117,116,112,117,116,32,116,111,32,34,98,105,103,95,102,117,114,121,46,112,110,103,34,0,0,0,0,0,0,73,110,118,97,108,105,100,32,115,66,73,84,32,100,101,112,116,104,32,115,112,101,99,105,102,105,101,100,0,0,0,0,108,105,98,112,110,103,32,119,97,114,110,105,110,103,58,32,37,115,0,0,0,0,0,0,108,105,98,112,110,103,32,119,97,114,110,105,110,103,32,110,111,46,32,37,115,58,32,37,115,0,0,0,0,0,0,0,32,98,105,103,95,102,117,114,121,46,112,118,114,32,98,105,103,95,102,117,114,121,46,112,110,103,0,0,0,0,0,0,86,97,108,105,100,32,112,97,108,101,116,116,101,32,114,101,113,117,105,114,101,100,32,102,111,114,32,112,97,108,101,116,116,101,100,32,105,109,97,103,101,115,0,0,0,0,0,0,84,114,117,110,99,97,116,105,110,103,32,112,114,111,102,105,108,101,32,116,111,32,97,99,116,117,97,108,32,108,101,110,103,116,104,32,105,110,32,105,67,67,80,32,99,104,117,110,107,0,0,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,69,120,97,109,112,108,101,115,58,0,0,0,0,0,0,0,69,109,98,101,100,100,101,100,32,112,114,111,102,105,108,101,32,108,101,110,103,116,104,32,116,111,111,32,108,97,114,103,101,32,105,110,32,105,67,67,80,32,99,104,117,110,107,0,79,117,116,32,111,102,32,77,101,109,111,114,121,33,0,0,32,32,32,32,32,32,32,32,32,32,32,45,53,58,32,68,88,84,53,0,0,0,0,0,34,32,102,111,114,32,114,101,97,100,105,110,103,0,0,0,69,109,98,101,100,100,101,100,32,112,114,111,102,105,108,101,32,108,101,110,103,116,104,32,105,110,32,105,67,67,80,32,99,104,117,110,107,32,105,115,32,110,101,103,97,116,105,118,101,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,102,105,108,116,101,114,32,104,101,117,114,105,115,116,105,99,32,109,101,116,104,111,100,0,32,32,32,32,32,32,32,32,32,32,32,45,51,58,32,68,88,84,51,0,0,0,0,0,85,110,107,110,111,119,110,32,99,111,109,112,114,101,115,115,105,111,110,32,116,121,112,101,32,105,110,32,105,67,67,80,32,99,104,117,110,107,0,0,32,32,32,32,32,32,32,32,32,32,32,45,49,58,32,68,88,84,49,0,0,0,0,0,110,97,110,0,0,0,0,0,73,110,118,97,108,105,100,32,115,82,71,66,32,114,101,110,100,101,114,105,110,103,32,105,110,116,101,110,116,32,115,112,101,99,105,102,105,101,100,0,67,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,32,32,32,45,48,58,32,85,110,99,111,109,112,114,101,115,115,101,100,0,0,0,0,0,73,110,118,97,108,105,100,32,102,105,108,116,101,114,32,109,101,116,104,111,100,32,105,110,32,73,72,68,82,0,0,0,73,110,118,97,108,105,100,32,122,108,105,98,32,99,111,109,112,114,101,115,115,105,111,110,32,109,101,116,104,111,100,32,111,114,32,102,108,97,103,115,32,105,110,32,73,68,65,84,0,0,0,0,0,0,0,0,118,101,99,116,111,114,0,0,32,32,45,48,49,51,53,58,32,70,111,114,99,101,115,32,116,104,101,32,117,115,101,32,111,102,32,116,104,101,32,102,111,108,108,111,119,105,110,103,32,100,101,99,111,109,112,114,101,115,115,105,111,110,32,97,108,103,111,114,105,116,104,109,58,32,0,0,0,0,0,0,85,110,107,110,111,119,110,32,102,105,108,116,101,114,32,109,101,116,104,111,100,32,105,110,32,73,72,68,82,0,0,0,115,116,114,101,97,109,32,101,110,100,0,0,0,0,0,0,73,103,110,111,114,105,110,103,32,114,101,113,117,101,115,116,32,116,111,32,119,114,105,116,101,32,97,32,80,76,84,69,32,99,104,117,110,107,32,105,110,32,103,114,97,121,115,99,97,108,101,32,80,78,71,0,37,46,48,76,102,0,0,0,77,78,71,32,102,101,97,116,117,114,101,115,32,97,114,101,32,110,111,116,32,97,108,108,111,119,101,100,32,105,110,32,97,32,80,78,71,32,100,97,116,97,115,116,114,101,97,109,0,0,0,0,0,0,0,0,32,32,45,104,32,32,32,58,32,84,104,105,115,32,104,101,108,112,46,0,0,0,0,0,87,114,105,116,101,32,69,114,114,111,114,0,0,0,0,0,77,78,71,32,102,101,97,116,117,114,101,115,32,97,114,101,32,110,111,116,32,97,108,108,111,119,101,100,32,105,110,32,97,32,80,78,71,32,100,97,116,97,115,116,114,101,97,109,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,110,117,109,98,101,114,32,111,102,32,99,111,108,111,114,115,32,105,110,32,112,97,108,101,116,116,101,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,79,112,116,105,111,110,115,58,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,98,105,116,32,100,101,112,116,104,32,102,111,114,32,82,71,66,32,105,109,97,103,101,0,85,110,107,110,111,119,110,32,99,111,109,112,114,101,115,115,105,111,110,32,109,101,116,104,111,100,32,105,110,32,73,72,68,82,0,0,0,0,0,0,80,111,116,101,110,116,105,97,108,32,111,118,101,114,102,108,111,119,32,105,110,32,112,110,103,95,122,97,108,108,111,99,40,41,0,0,0,0,0,0,73,103,110,111,114,105,110,103,32,97,116,116,101,109,112,116,32,116,111,32,115,101,116,32,99,72,82,77,32,82,71,66,32,116,114,105,97,110,103,108,101,32,119,105,116,104,32,122,101,114,111,32,97,114,101,97,0,0,0,0,0,0,0,0,122,108,105,98,32,102,97,105,108,101,100,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,99,111,109,112,114,101,115,115,111,114,0,0,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,122,108,105,98,32,101,114,114,111,114,0,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,32,91,45,48,49,51,53,104,93,32,60,115,111,117,114,99,101,46,112,118,114,62,32,91,116,97,114,103,101,116,46,112,110,103,93,0,0,0,0,0,77,111,110,0,0,0,0,0,85,110,107,110,111,119,110,32,105,110,116,101,114,108,97,99,101,32,109,101,116,104,111,100,32,105,110,32,73,72,68,82,0,0,0,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,99,72,82,77,32,98,108,117,101,32,112,111,105,110,116,0,122,108,105,98,32,102,97,105,108,101,100,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,99,111,109,112,114,101,115,115,111,114,32,45,45,32,109,101,109,32,101,114,114,111,114,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,112,110,103,95,119,114,105,116,101,95,105,110,102,111,32,119,97,115,32,110,101,118,101,114,32,99,97,108,108,101,100,32,98,101,102,111,114,101,32,112,110,103,95,119,114,105,116,101,95,114,111,119,46,0,0,0,32,32,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,99,111,108,111,114,32,116,121,112,101,47,98,105,116,32,100,101,112,116,104,32,99,111,109,98,105,110,97,116,105,111,110,32,105,110,32,73,72,68,82,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,87,114,105,116,105,110,103,32,122,101,114,111,45,108,101,110,103,116,104,32,117,110,107,110,111,119,110,32,99,104,117,110,107,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,99,72,82,77,32,103,114,101,101,110,32,112,111,105,110,116,0,0,0,0,0,0,0,0,122,108,105,98,32,102,97,105,108,101,100,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,99,111,109,112,114,101,115,115,111,114,32,45,45,32,115,116,114,101,97,109,32,101,114,114,111,114,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,85,115,97,103,101,58,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,99,111,108,111,114,32,116,121,112,101,32,105,110,32,73,72,68,82,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,73,110,118,97,108,105,100,32,99,72,82,77,32,114,101,100,32,112,111,105,110,116,0,0,122,108,105,98,32,102,97,105,108,101,100,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,99,111,109,112,114,101,115,115,111,114,32,45,45,32,118,101,114,115,105,111,110,32,101,114,114,111,114,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,119,97,115,32,111,114,105,103,105,110,97,108,108,121,32,109,97,100,101,32,102,111,114,32,116,104,101,32,88,66,111,120,32,118,101,114,115,105,111,110,32,111,102,32,116,104,101,32,103,97,109,101,32,83,104,101,110,109,117,101,32,73,73,46,0,0,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,111,112,101,110,32,34,0,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,8,9,9,10,10,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,16,16,16,16,17,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,0,1,2,3,4,4,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8,8,8,8,9,9,9,9,9,9,9,9,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,0,0,16,17,18,18,19,19,20,20,20,20,21,21,21,21,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,232,99,0,0,40,0,0,0,136,0,0,0,82,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,99,0,0,222,0,0,0,180,0,0,0,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,100,0,0,82,0,0,0,38,1,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,100,0,0,112,0,0,0,34,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,100,0,0,112,0,0,0,12,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,100,0,0,112,0,0,0,26,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,100,0,0,184,0,0,0,98,0,0,0,60,0,0,0,2,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,100,0,0,30,1,0,0,206,0,0,0,60,0,0,0,4,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,100,0,0,178,0,0,0,208,0,0,0,60,0,0,0,10,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,100,0,0,32,1,0,0,156,0,0,0,60,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,101,0,0,28,1,0,0,110,0,0,0,60,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,101,0,0,176,0,0,0,128,0,0,0,60,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,101,0,0,50,0,0,0,130,0,0,0,60,0,0,0,134,0,0,0,4,0,0,0,42,0,0,0,6,0,0,0,28,0,0,0,68,0,0,0,2,0,0,0,248,255,255,255,144,101,0,0,22,0,0,0,10,0,0,0,36,0,0,0,14,0,0,0,2,0,0,0,32,0,0,0,140,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,101,0,0,18,1,0,0,254,0,0,0,60,0,0,0,20,0,0,0,18,0,0,0,72,0,0,0,36,0,0,0,24,0,0,0,2,0,0,0,6,0,0,0,248,255,255,255,184,101,0,0,70,0,0,0,114,0,0,0,126,0,0,0,138,0,0,0,102,0,0,0,48,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,101,0,0,90,0,0,0,212,0,0,0,60,0,0,0,50,0,0,0,42,0,0,0,16,0,0,0,62,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,101,0,0,72,0,0,0,76,0,0,0,60,0,0,0,46,0,0,0,90,0,0,0,24,0,0,0,78,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,0,0,22,1,0,0,2,0,0,0,60,0,0,0,40,0,0,0,32,0,0,0,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,102,0,0,58,0,0,0,236,0,0,0,60,0,0,0,16,0,0,0,14,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,102,0,0,242,0,0,0,132,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,102,0,0,38,0,0,0,154,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,102,0,0,10,0,0,0,190,0,0,0,60,0,0,0,8,0,0,0,6,0,0,0,14,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,2,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,102,0,0,116,0,0,0,24,0,0,0,60,0,0,0,20,0,0,0,24,0,0,0,44,0,0,0,22,0,0,0,30,0,0,0,8,0,0,0,6,0,0,0,18], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10240);
/* memory initializer */ allocate([152,102,0,0,52,0,0,0,32,0,0,0,60,0,0,0,60,0,0,0,58,0,0,0,50,0,0,0,52,0,0,0,40,0,0,0,56,0,0,0,48,0,0,0,66,0,0,0,64,0,0,0,62,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,102,0,0,66,0,0,0,4,0,0,0,60,0,0,0,90,0,0,0,82,0,0,0,76,0,0,0,78,0,0,0,70,0,0,0,80,0,0,0,74,0,0,0,88,0,0,0,86,0,0,0,84,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,102,0,0,86,0,0,0,108,0,0,0,60,0,0,0,8,0,0,0,20,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,102,0,0,36,0,0,0,194,0,0,0,60,0,0,0,18,0,0,0,24,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,102,0,0,16,0,0,0,204,0,0,0,60,0,0,0,2,0,0,0,10,0,0,0,16,0,0,0,132,0,0,0,108,0,0,0,30,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,103,0,0,198,0,0,0,148,0,0,0,60,0,0,0,14,0,0,0,16,0,0,0,24,0,0,0,54,0,0,0,8,0,0,0,26,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,103,0,0,198,0,0,0,28,0,0,0,60,0,0,0,6,0,0,0,4,0,0,0,4,0,0,0,106,0,0,0,64,0,0,0,12,0,0,0,144,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,103,0,0,198,0,0,0,118,0,0,0,60,0,0,0,12,0,0,0,8,0,0,0,28,0,0,0,30,0,0,0,78,0,0,0,10,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,103,0,0,198,0,0,0,46,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,103,0,0,70,0,0,0,174,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,103,0,0,198,0,0,0,92,0,0,0,60,0,0,0,34,0,0,0,2,0,0,0,16,0,0,0,34,0,0,0,18,0,0,0,46,0,0,0,50,0,0,0,6,0,0,0,6,0,0,0,26,0,0,0,20,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,103,0,0,36,1,0,0,48,0,0,0,60,0,0,0,12,0,0,0,36,0,0,0,34,0,0,0,58,0,0,0,10,0,0,0,20,0,0,0,42,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,232,103,0,0,232,0,0,0,220,0,0,0,200,255,255,255,200,255,255,255,232,103,0,0,42,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,103,0,0,80,0,0,0,250,0,0,0,84,0,0,0,22,0,0,0,28,0,0,0,56,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,104,0,0,198,0,0,0,100,0,0,0,60,0,0,0,12,0,0,0,8,0,0,0,28,0,0,0,30,0,0,0,78,0,0,0,10,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,104,0,0,198,0,0,0,182,0,0,0,60,0,0,0,12,0,0,0,8,0,0,0,28,0,0,0,30,0,0,0,78,0,0,0,10,0,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,104,0,0,62,0,0,0,240,0,0,0,86,0,0,0,60,0,0,0,26,0,0,0,6,0,0,0,52,0,0,0,92,0,0,0,32,0,0,0,136,0,0,0,12,0,0,0,52,0,0,0,30,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,104,0,0,146,0,0,0,8,1,0,0,108,0,0,0,38,0,0,0,16,0,0,0,22,0,0,0,94,0,0,0,110,0,0,0,54,0,0,0,28,0,0,0,26,0,0,0,8,0,0,0,68,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,104,0,0,14,0,0,0,138,0,0,0,86,0,0,0,60,0,0,0,30,0,0,0,18,0,0,0,52,0,0,0,92,0,0,0,32,0,0,0,6,0,0,0,12,0,0,0,56,0,0,0,30,0,0,0,46,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,112,104,0,0,56,0,0,0,234,0,0,0,252,255,255,255,252,255,255,255,112,104,0,0,164,0,0,0,144,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,136,104,0,0,244,0,0,0,10,1,0,0,252,255,255,255,252,255,255,255,136,104,0,0,126,0,0,0,226,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,160,104,0,0,104,0,0,0,40,1,0,0,248,255,255,255,248,255,255,255,160,104,0,0,200,0,0,0,4,1,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,184,104,0,0,124,0,0,0,230,0,0,0,248,255,255,255,248,255,255,255,184,104,0,0,152,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,104,0,0,228,0,0,0,202,0,0,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,104,0,0,24,1,0,0,2,1,0,0,28,0,0,0,38,0,0,0,16,0,0,0,22,0,0,0,60,0,0,0,110,0,0,0,54,0,0,0,28,0,0,0,26,0,0,0,8,0,0,0,50,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,105,0,0,172,0,0,0,196,0,0,0,52,0,0,0,60,0,0,0,30,0,0,0,18,0,0,0,96,0,0,0,92,0,0,0,32,0,0,0,6,0,0,0,12,0,0,0,56,0,0,0,64,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,105,0,0,252,0,0,0,160,0,0,0,60,0,0,0,68,0,0,0,128,0,0,0,44,0,0,0,114,0,0,0,8,0,0,0,48,0,0,0,56,0,0,0,38,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,105,0,0,122,0,0,0,68,0,0,0,60,0,0,0,120,0,0,0,4,0,0,0,94,0,0,0,34,0,0,0,112,0,0,0,40,0,0,0,124,0,0,0,74,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,105,0,0,0,1,0,0,134,0,0,0,60,0,0,0,18,0,0,0,62,0,0,0,12,0,0,0,66,0,0,0,120,0,0,0,76,0,0,0,100,0,0,0,80,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,105,0,0,88,0,0,0,188,0,0,0,60,0,0,0,112,0,0,0,116,0,0,0,46,0,0,0,102,0,0,0,42,0,0,0,36,0,0,0,86,0,0,0,100,0,0,0,98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,105,0,0,106,0,0,0,22,0,0,0,58,0,0,0,38,0,0,0,16,0,0,0,22,0,0,0,94,0,0,0,110,0,0,0,54,0,0,0,72,0,0,0,88,0,0,0,14,0,0,0,68,0,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,105,0,0,20,0,0,0,246,0,0,0,88,0,0,0,60,0,0,0,30,0,0,0,18,0,0,0,52,0,0,0,92,0,0,0,32,0,0,0,104,0,0,0,24,0,0,0,2,0,0,0,30,0,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,105,0,0,26,1,0,0,224,0,0,0,74,0,0,0,170,0,0,0,14,0,0,0,2,0,0,0,8,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,106,0,0,6,0,0,0,102,0,0,0,148,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,111,117,116,95,111,102,95,114,97,110,103,101,0,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,49,95,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,98,97,115,105,99,95,111,115,116,114,105,110,103,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,105,110,103,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,53,69,114,114,111,114,0,0,0,0,0,0,152,87,0,0,0,0,0,0,168,87,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,87,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,87,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,87,0,0,56,100,0,0,0,0,0,0,0,0,0,0,248,87,0,0,56,100,0,0,0,0,0,0,0,0,0,0,16,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,88,0,0,80,87,0,0,56,88,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,24,105,0,0,0,0,0,0,80,87,0,0,128,88,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,32,105,0,0,0,0,0,0,80,87,0,0,200,88,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,40,105,0,0,0,0,0,0,80,87,0,0,16,89,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,48,105,0,0,0,0,0,0,0,0,0,0,88,89,0,0,64,102,0,0,0,0,0,0,0,0,0,0,136,89,0,0,64,102,0,0,0,0,0,0,80,87,0,0,184,89,0,0,0,0,0,0,1,0,0,0,88,104,0,0,0,0,0,0,80,87,0,0,208,89,0,0,0,0,0,0,1,0,0,0,88,104,0,0,0,0,0,0,80,87,0,0,232,89,0,0,0,0,0,0,1,0,0,0,96,104,0,0,0,0,0,0,80,87,0,0,0,90,0,0,0,0,0,0,1,0,0,0,96,104,0,0,0,0,0,0,80,87,0,0,24,90,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,200,105,0,0,0,8,0,0,80,87,0,0,96,90,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,200,105,0,0,0,8,0,0,80,87,0,0,168,90,0,0,0,0,0,0,3,0,0,0,120,103,0,0,2,0,0,0,72,100,0,0,2,0,0,0,216,103,0,0,0,8,0,0,80,87,0,0,240,90,0,0,0,0,0,0,3,0,0,0,120,103,0,0,2,0,0,0,72,100,0,0,2,0,0,0,224,103,0,0,0,8,0,0,0,0,0,0,56,91,0,0,120,103,0,0,0,0,0,0,0,0,0,0,80,91,0,0,120,103,0,0,0,0,0,0,80,87,0,0,104,91,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,104,104,0,0,2,0,0,0,80,87,0,0,128,91,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,104,104,0,0,2,0,0,0,0,0,0,0,152,91,0,0,0,0,0,0,176,91,0,0,208,104,0,0,0,0,0,0,80,87,0,0,208,91,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,240,100,0,0,0,0,0,0,80,87,0,0,24,92,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,8,101,0,0,0,0,0,0,80,87,0,0,96,92,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,32,101,0,0,0,0,0,0,80,87,0,0,168,92,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,56,101,0,0,0,0,0,0,0,0,0,0,240,92,0,0,120,103,0,0,0,0,0,0,0,0,0,0,8,93,0,0,120,103,0,0,0,0,0,0,80,87,0,0,32,93,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,224,104,0,0,2,0,0,0,80,87,0,0,72,93,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,224,104,0,0,2,0,0,0,80,87,0,0,112,93,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,224,104,0,0,2,0,0,0,80,87,0,0,152,93,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,224,104,0,0,2,0,0,0,0,0,0,0,192,93,0,0,80,104,0,0,0,0,0,0,0,0,0,0,216,93,0,0,120,103,0,0,0,0,0,0,80,87,0,0,240,93,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,192,105,0,0,2,0,0,0,80,87,0,0,8,94,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,192,105,0,0,2,0,0,0,0,0,0,0,32,94,0,0,0,0,0,0,72,94,0,0,0,0,0,0,112,94,0,0,136,104,0,0,0,0,0,0,0,0,0,0,184,94,0,0,232,104,0,0,0,0,0,0,0,0,0,0,216,94,0,0,88,103,0,0,0,0,0,0,0,0,0,0,0,95,0,0,88,103,0,0,0,0,0,0,0,0,0,0,40,95,0,0,64,104,0,0,0,0,0,0,0,0,0,0,112,95,0,0,0,0,0,0,168,95,0,0,0,0,0,0,224,95,0,0,0,0,0,0,0,96,0,0,0,0,0,0,32,96,0,0,0,0,0,0,64,96,0,0,0,0,0,0,96,96,0,0,80,87,0,0,120,96,0,0,0,0,0,0,1,0,0,0,208,100,0,0,3,244,255,255,80,87,0,0,168,96,0,0,0,0,0,0,1,0,0,0,224,100,0,0,3,244,255,255,80,87,0,0,216,96,0,0,0,0,0,0,1,0,0,0,208,100,0,0,3,244,255,255,80,87,0,0,8,97,0,0,0,0,0,0,1,0,0,0,224,100,0,0,3,244,255,255,0,0,0,0,56,97,0,0,8,100,0,0,0,0,0,0,0,0,0,0,80,97,0,0,0,0,0,0,104,97,0,0,72,104,0,0,0,0,0,0,0,0,0,0,128,97,0,0,56,104,0,0,0,0,0,0,0,0,0,0,160,97,0,0,64,104,0,0,0,0,0,0,0,0,0,0,192,97,0,0,0,0,0,0,224,97,0,0,0,0,0,0,0,98,0,0,0,0,0,0,32,98,0,0,80,87,0,0,64,98,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,184,105,0,0,2,0,0,0,80,87,0,0,96,98,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,184,105,0,0,2,0,0,0,80,87,0,0,128,98,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,184,105,0,0,2,0,0,0,80,87,0,0,160,98,0,0,0,0,0,0,2,0,0,0,120,103,0,0,2,0,0,0,184,105,0,0,2,0,0,0,0,0,0,0,192,98,0,0,0,0,0,0,216,98,0,0,0,0,0,0,240,98,0,0,0,0,0,0,8,99,0,0,56,104,0,0,0,0,0,0,0,0,0,0,32,99,0,0,64,104,0,0,0,0,0,0,0,0,0,0,56,99,0,0,16,106,0,0,0,0,0,0,0,0,0,0,96,99,0,0,16,106,0,0,0,0,0,0,0,0,0,0,136,99,0,0,32,106,0,0,0,0,0,0,0,0,0,0,176,99,0,0,224,99,0,0,0,0,0,0,0,0,0,0,216,99,0,0,0,0,0,0,0,0,0,0,56,0,0,0,0,0,0,0,136,104,0,0,244,0,0,0,10,1,0,0,200,255,255,255,200,255,255,255,136,104,0,0,126,0,0,0,226,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+20492);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
  
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
  
        if (!total) {
          // early out
          return callback(null);
        }
  
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
  
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
  
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
  
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat, node;
  
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
  
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
  
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
  
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
  
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          FS.FSNode.prototype = {};
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
  
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }

  
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  
  
  
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  
  function ___resumeException(ptr) {
      if (!___cxa_last_thrown_exception) { ___cxa_last_thrown_exception = ptr; }
      throw ptr;
    }
  
  var ___cxa_last_thrown_exception=0;
  
  var ___cxa_exception_header_size=8;function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = ___cxa_last_thrown_exception;
      header = thrown - ___cxa_exception_header_size;
      if (throwntype == -1) throwntype = HEAP32[((header)>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
  
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___gxx_personality_v0() {
    }

  function ___cxa_allocate_exception(size) {
      var ptr = _malloc(size + ___cxa_exception_header_size);
      return ptr + ___cxa_exception_header_size;
    }

  function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      var header = ptr - ___cxa_exception_header_size;
      HEAP32[((header)>>2)]=type;
      HEAP32[(((header)+(4))>>2)]=destructor;
      ___cxa_last_thrown_exception = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr;
    }

  
  var ___cxa_caught_exceptions=[];function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      ___cxa_caught_exceptions.push(___cxa_last_thrown_exception);
      return ptr;
    }

  
  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }

  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr - ___cxa_exception_header_size);
      } catch(e) { // XXX FIXME
      }
    }

  
  
  
  
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }

  function _llvm_eh_typeid_for(type) {
      return type;
    }

  
  var ____cxa_exception_header_size=undefined;function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Call destructor if one is registered then clear it.
      var ptr = ___cxa_caught_exceptions.pop();
      if (ptr) {
        header = ptr - ___cxa_exception_header_size;
        var destructor = HEAP32[(((header)+(4))>>2)];
        if (destructor) {
          Runtime.dynCall('vi', destructor, [ptr]);
          HEAP32[(((header)+(4))>>2)]=0;
        }
        ___cxa_free_exception(ptr);
        ___cxa_last_thrown_exception = 0;
      }
    }

   
  Module["_strlen"] = _strlen;

  
   
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  
   
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;


  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

   
  Module["_memcmp"] = _memcmp;

  
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }

  function __ZNSt9exceptionD2Ev() {}

  var _llvm_memset_p0i8_i64=_memset;

  function _llvm_lifetime_start() {}

  function _llvm_lifetime_end() {}

  
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision === -1) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }

  
  
  
  
  
  function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    } 
  Module["_saveSetjmp"] = _saveSetjmp;
  
   
  Module["_testSetjmp"] = _testSetjmp;var _setjmp=undefined;

  function _abort() {
      Module['abort']();
    }

  var _fabs=Math_abs;

  
  function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }

  function _longjmp(env, value) {
      asm['setThrew'](env, value || 1);
      throw 'longjmp';
    }




  function _pthread_mutex_lock() {}

  function _pthread_mutex_unlock() {}

  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }

  function ___cxa_guard_release() {}

  function _pthread_cond_broadcast() {
      return 0;
    }

  function _pthread_cond_wait() {
      return 0;
    }

  
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;

  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      stream = FS.getStream(stream);
      if (!stream) {
        return -1;
      }
      if (c === -1) {
        // do nothing for EOF character
        return c;
      }
      c = unSign(c & 0xFF);
      stream.ungotten.push(c);
      stream.eof = false;
      return c;
    }

  
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }var _getc=_fgetc;

  function ___errno_location() {
      return ___errno_state;
    }

  
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }

  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      var ptr = ___cxa_caught_exceptions.pop();
      throw ptr;
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function ___cxa_guard_abort() {}

  
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }var _isxdigit_l=_isxdigit;

  
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }var _isdigit_l=_isdigit;

  
  
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
  
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
  
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
  
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
  
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
  
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
  
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
  
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
  
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
  
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }

  function _catopen(name, oflag) {
      // nl_catd catopen (const char *name, int oflag)
      return -1;
    }

  function _catgets(catd, set_id, msg_id, s) {
      // char *catgets (nl_catd catd, int set_id, int msg_id, const char *s)
      return s;
    }

  function _catclose(catd) {
      // int catclose (nl_catd catd)
      return 0;
    }

  function _newlocale(mask, locale, base) {
      return _malloc(4);
    }

  function _freelocale(locale) {
      _free(locale);
    }

  function _isascii(chr) {
      return chr >= 0 && (chr & 0x80) == 0;
    }

  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i];
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i];
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }

  
  
  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]);
      return sum;
    }
  
  
  var __MONTH_DAYS_LEAP=[31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR=[31,28,31,30,31,30,31,31,30,31,30,31];function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while(days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month 
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)]
      };
  
      var pattern = Pointer_stringify(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate date representation
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value === 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      };
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      };
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        };
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      };
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      };
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else { 
            return thisDate.getFullYear()-1;
          }
      };
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls(Math.floor(year/100),2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year. 
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes 
          // January 4th, which is also the week that includes the first Thursday of the year, and 
          // is also the first week that contains at least four days in the year. 
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of 
          // the last week of the preceding year; thus, for Saturday 2nd January 1999, 
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th, 
          // or 31st is a Monday, it and any following days are part of week 1 of the following year. 
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
          
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          return leadingNulls(date.tm_hour < 13 ? date.tm_hour : date.tm_hour-12, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour > 0 && date.tm_hour < 13) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay() || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Sunday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
          
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week) 
          // as a decimal number [01,53]. If the week containing 1 January has four 
          // or more days in the new year, then it is considered week 1. 
          // Otherwise, it is the last week of the previous year, and the next week is week 1. 
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          } 
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          var day = new Date(date.tm_year+1900, date.tm_mon+1, date.tm_mday, 0, 0, 0, 0);
          return day.getDay();
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53]. 
          // The first Monday of January is the first day of week 1; 
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ),
          // or by no characters if no timezone is determinable. 
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich). 
          // If tm_isdst is zero, the standard time offset is used. 
          // If tm_isdst is greater than zero, the daylight savings time offset is used. 
          // If tm_isdst is negative, no characters are returned. 
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%Z': function(date) {
          // Replaced by the timezone name or abbreviation, or by no bytes if no timezone information exists. [ tm_isdst]
          // FIXME: we cannot determine time zone (or can we?)
          return '';
        },
        '%%': function() {
          return '%';
        }
      };
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      } 
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }var _strftime_l=_strftime;

  
  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      var start = str;
  
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
  
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return ((asm["setTempRet0"](0),0)|0);
      }
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
  
      return ((asm["setTempRet0"](((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)),((HEAP32[((tempDoublePtr)>>2)])|0))|0);
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }var _strtoull_l=_strtoull;

  
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }var _strtoll_l=_strtoll;

  function _uselocale(locale) {
      return 0;
    }

  var _llvm_va_start=undefined;

  
  
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }

  function _llvm_va_end() {}

  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }

  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }


  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }

  
  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }var _copysignl=_copysign;

  
  function _fmod(x, y) {
      return x % y;
    }var _fmodl=_fmod;






  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    return Module["dynCall_iiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
  try {
    return Module["dynCall_iiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15) {
  try {
    Module["dynCall_viiiiiiiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiid(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiid"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_fiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_fiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiid(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiid"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  try {
    Module["dynCall_viiiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_diii(index,a1,a2,a3) {
  try {
    return Module["dynCall_diii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdin|0;var p=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var q=env._stderr|0;var r=env._stdout|0;var s=env.__ZTISt9exception|0;var t=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var u=env.___fsmu8|0;var v=env.___dso_handle|0;var w=+env.NaN;var x=+env.Infinity;var y=0;var z=0;var A=0;var B=0;var C=0,D=0,E=0,F=0,G=0.0,H=0,I=0,J=0,K=0.0;var L=0;var M=0;var N=0;var O=0;var P=0;var Q=0;var R=0;var S=0;var T=0;var U=0;var V=global.Math.floor;var W=global.Math.abs;var X=global.Math.sqrt;var Y=global.Math.pow;var Z=global.Math.cos;var _=global.Math.sin;var $=global.Math.tan;var aa=global.Math.acos;var ba=global.Math.asin;var ca=global.Math.atan;var da=global.Math.atan2;var ea=global.Math.exp;var fa=global.Math.log;var ga=global.Math.ceil;var ha=global.Math.imul;var ia=env.abort;var ja=env.assert;var ka=env.asmPrintInt;var la=env.asmPrintFloat;var ma=env.min;var na=env.invoke_iiiiiiii;var oa=env.invoke_viiiii;var pa=env.invoke_vi;var qa=env.invoke_vii;var ra=env.invoke_ii;var sa=env.invoke_iiiiiiiiiiii;var ta=env.invoke_iiii;var ua=env.invoke_viiiiiiiiiiiiiii;var va=env.invoke_viiiiid;var wa=env.invoke_viiiiiiii;var xa=env.invoke_viiiiii;var ya=env.invoke_fiii;var za=env.invoke_viiiiiii;var Aa=env.invoke_viiiiiid;var Ba=env.invoke_viiiiiiiii;var Ca=env.invoke_viiiiiiiiii;var Da=env.invoke_iii;var Ea=env.invoke_diii;var Fa=env.invoke_i;var Ga=env.invoke_iiiiii;var Ha=env.invoke_viii;var Ia=env.invoke_v;var Ja=env.invoke_iiiiiiiii;var Ka=env.invoke_iiiii;var La=env.invoke_viiii;var Ma=env._llvm_lifetime_end;var Na=env.__scanString;var Oa=env._fclose;var Pa=env._pthread_mutex_lock;var Qa=env.___cxa_end_catch;var Ra=env._strtoull;var Sa=env._fflush;var Ta=env._fputc;var Ua=env._fwrite;var Va=env._send;var Wa=env._isspace;var Xa=env._read;var Ya=env._fsync;var Za=env.___cxa_guard_abort;var _a=env._newlocale;var $a=env.___gxx_personality_v0;var ab=env._pthread_cond_wait;var bb=env.___cxa_rethrow;var cb=env._fmod;var db=env.___resumeException;var eb=env._llvm_va_end;var fb=env._vsscanf;var gb=env._snprintf;var hb=env._fgetc;var ib=env.__getFloat;var jb=env._atexit;var kb=env.___cxa_free_exception;var lb=env._close;var mb=env.___setErrNo;var nb=env._isxdigit;var ob=env._exit;var pb=env._sprintf;var qb=env.___ctype_b_loc;var rb=env._freelocale;var sb=env._catgets;var tb=env.__isLeapYear;var ub=env._asprintf;var vb=env.___cxa_is_number_type;var wb=env.___cxa_does_inherit;var xb=env.___cxa_guard_acquire;var yb=env.___cxa_begin_catch;var zb=env._recv;var Ab=env.__parseInt64;var Bb=env.__ZSt18uncaught_exceptionv;var Cb=env._putchar;var Db=env.__ZNSt9exceptionD2Ev;var Eb=env._copysign;var Fb=env.__exit;var Gb=env._strftime;var Hb=env.___cxa_throw;var Ib=env._pread;var Jb=env._fopen;var Kb=env._open;var Lb=env.__arraySum;var Mb=env.___cxa_find_matching_catch;var Nb=env.__formatString;var Ob=env._pthread_cond_broadcast;var Pb=env.__ZSt9terminatev;var Qb=env._isascii;var Rb=env._pthread_mutex_unlock;var Sb=env.___cxa_call_unexpected;var Tb=env._sbrk;var Ub=env.___errno_location;var Vb=env._strerror;var Wb=env._catclose;var Xb=env._llvm_lifetime_start;var Yb=env.___cxa_guard_release;var Zb=env._ungetc;var _b=env._uselocale;var $b=env._vsnprintf;var ac=env._sscanf;var bc=env._sysconf;var cc=env._fread;var dc=env._abort;var ec=env._fprintf;var fc=env._isdigit;var gc=env._strtoll;var hc=env.__addDays;var ic=env._fabs;var jc=env.__reallyNegative;var kc=env._write;var lc=env.___cxa_allocate_exception;var mc=env._longjmp;var nc=env._vasprintf;var oc=env._catopen;var pc=env.___ctype_toupper_loc;var qc=env.___ctype_tolower_loc;var rc=env._llvm_eh_typeid_for;var sc=env._pwrite;var tc=env._strerror_r;var uc=env._time;var vc=0.0;
// EMSCRIPTEN_START_FUNCS
function Ze(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;g=i;i=i+40|0;h=g|0;n=g+8|0;q=g+16|0;o=g+24|0;k=f+4|0;l=(a[k]|0)==8?6:10;m=f+12|0;j=c[m>>2]|0;p=We(e,c[f>>2]|0,q)|0;if((p|0)==0){i=g;return}s=p+2+(ha(l,j)|0)|0;r=n|0;j=(e|0)==0;if(!j){a[r]=s>>>24;a[n+1|0]=s>>>16;a[n+2|0]=s>>>8;a[n+3|0]=s;z=n+4|0;D=d[1688]|d[1689]<<8|d[1690]<<16|d[1691]<<24|0;a[z]=D;D=D>>8;a[z+1|0]=D;D=D>>8;a[z+2|0]=D;D=D>>8;a[z+3|0]=D;qf(e,r,8);z=e+376|0;D=d[1688]|d[1689]<<8|d[1690]<<16|d[1691]<<24|0;a[z]=D;D=D>>8;a[z+1|0]=D;D=D>>8;a[z+2|0]=D;D=D>>8;a[z+3|0]=D;Qd(e);Rd(e,1688,4)}n=c[q>>2]|0;p=p+1|0;if(!(j|(n|0)==0|(p|0)==0)){qf(e,n,p);Rd(e,n,p)}if(!j){qf(e,k,1);Rd(e,k,1)}z=f+8|0;y=c[z>>2]|0;x=c[m>>2]|0;a:do{if((x|0)>0){q=o|0;v=o+1|0;u=o+2|0;s=o+3|0;r=o+4|0;p=o+5|0;w=o+6|0;f=o+7|0;t=o+8|0;o=o+9|0;if(!j){while(1){x=b[y>>1]|0;if((a[k]|0)==8){a[q]=x;a[v]=b[y+2>>1];a[u]=b[y+4>>1];a[s]=b[y+6>>1];x=b[y+8>>1]|0;a[r]=(x&65535)>>>8;a[p]=x}else{a[q]=(x&65535)>>>8;a[v]=x;x=b[y+2>>1]|0;a[u]=(x&65535)>>>8;a[s]=x;x=b[y+4>>1]|0;a[r]=(x&65535)>>>8;a[p]=x;x=b[y+6>>1]|0;a[w]=(x&65535)>>>8;a[f]=x;x=b[y+8>>1]|0;a[t]=(x&65535)>>>8;a[o]=x}qf(e,q,l);Rd(e,q,l);y=y+10|0;if(y>>>0>=((c[z>>2]|0)+((c[m>>2]|0)*10|0)|0)>>>0){break a}}}m=a[k]|0;l=y;do{k=b[l>>1]|0;if(m<<24>>24==8){a[q]=k;a[v]=b[l+2>>1];a[u]=b[l+4>>1];a[s]=b[l+6>>1];z=b[l+8>>1]|0;a[r]=(z&65535)>>>8;a[p]=z}else{a[q]=(k&65535)>>>8;a[v]=k;z=b[l+2>>1]|0;a[u]=(z&65535)>>>8;a[s]=z;z=b[l+4>>1]|0;a[r]=(z&65535)>>>8;a[p]=z;z=b[l+6>>1]|0;a[w]=(z&65535)>>>8;a[f]=z;z=b[l+8>>1]|0;a[t]=(z&65535)>>>8;a[o]=z}l=l+10|0;}while(l>>>0<(y+(x*10|0)|0)>>>0)}}while(0);k=h|0;if(!j){z=c[e+364>>2]|0;a[k]=z>>>24;a[h+1|0]=z>>>16;a[h+2|0]=z>>>8;a[h+3|0]=z;qf(e,k,4)}re(e,n);i=g;return}function _e(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;f=g|0;a:do{if((e&2|0)==0){h=a[c+3|0]|0;do{if(h<<24>>24!=0){if((h&255)>>>0>(d[b+388|0]|0)>>>0){break}a[f|0]=h;h=1;break a}}while(0);we(b,15864);i=g;return}else{if((e|0)==3){h=8}else{h=d[b+388|0]|0}j=a[c|0]|0;do{if(!(j<<24>>24==0|(j&255)>>>0>h>>>0)){k=a[c+1|0]|0;if(k<<24>>24==0|(k&255)>>>0>h>>>0){break}l=a[c+2|0]|0;if(l<<24>>24==0|(l&255)>>>0>h>>>0){break}a[f|0]=j;a[f+1|0]=k;a[f+2|0]=l;h=3;break a}}while(0);we(b,15864);i=g;return}}while(0);b:do{if((e&4|0)!=0){c=a[c+4|0]|0;do{if(c<<24>>24!=0){if((c&255)>>>0>(d[b+388|0]|0)>>>0){break}a[f+h|0]=c;h=h+1|0;break b}}while(0);we(b,15864);i=g;return}}while(0);Oe(b,1704,f|0,h);i=g;return}function $e(b,c,d,e,f,g,h,j,k){b=b|0;c=+c;d=+d;e=+e;f=+f;g=+g;h=+h;j=+j;k=+k;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;m=i;i=i+32|0;l=m|0;n=~~(c*1.0e5+.5);o=~~(d*1.0e5+.5);p=~~(e*1.0e5+.5);q=~~(f*1.0e5+.5);r=~~(g*1.0e5+.5);s=~~(h*1.0e5+.5);t=~~(j*1.0e5+.5);u=~~(k*1.0e5+.5);if((Wd(b,n,o,p,q,r,s,t,u)|0)==0){i=m;return}v=l|0;a[v]=n>>>24;a[l+1|0]=n>>>16;a[l+2|0]=n>>>8;a[l+3|0]=n;a[l+4|0]=o>>>24;a[l+5|0]=o>>>16;a[l+6|0]=o>>>8;a[l+7|0]=o;a[l+8|0]=p>>>24;a[l+9|0]=p>>>16;a[l+10|0]=p>>>8;a[l+11|0]=p;a[l+12|0]=q>>>24;a[l+13|0]=q>>>16;a[l+14|0]=q>>>8;a[l+15|0]=q;a[l+16|0]=r>>>24;a[l+17|0]=r>>>16;a[l+18|0]=r>>>8;a[l+19|0]=r;a[l+20|0]=s>>>24;a[l+21|0]=s>>>16;a[l+22|0]=s>>>8;a[l+23|0]=s;a[l+24|0]=t>>>24;a[l+25|0]=t>>>16;a[l+26|0]=t>>>8;a[l+27|0]=t;a[l+28|0]=u>>>24;a[l+29|0]=u>>>16;a[l+30|0]=u>>>8;a[l+31|0]=u;Oe(b,1912,v,32);i=m;return}function af(c,f,g,h,j){c=c|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0;l=i;i=i+8|0;k=l|0;if((j|0)==0){g=b[g+8>>1]|0;if((g&65535|0)<(1<<d[c+387|0]|0)){j=k|0;a[j]=(g&65535)>>>8;a[k+1|0]=g;Oe(c,1656,j,2);i=l;return}else{we(c,15608);i=l;return}}else if((j|0)==2){f=k|0;m=b[g+2>>1]|0;h=(m&65535)>>>8;a[f]=h;a[k+1|0]=m;m=b[g+4>>1]|0;j=(m&65535)>>>8;a[k+2|0]=j;a[k+3|0]=m;m=b[g+6>>1]|0;g=(m&65535)>>>8;a[k+4|0]=g;a[k+5|0]=m;do{if((a[c+387|0]|0)==8){if((j|h|g)<<16>>16==0){break}we(c,15400);i=l;return}}while(0);Oe(c,1656,f,6);i=l;return}else if((j|0)==3){do{if((h|0)>=1){if((e[c+372>>1]|0)<(h|0)){break}Oe(c,1656,f,h);i=l;return}}while(0);we(c,15736);i=l;return}else{we(c,15312);i=l;return}}function bf(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+8|0;j=h|0;if((g|0)==3){g=b[e+372>>1]|0;do{if(g<<16>>16==0){if((c[e+652>>2]&1|0)==0){k=5;break}f=a[f|0]|0}else{k=5}}while(0);do{if((k|0)==5){f=a[f|0]|0;if((f&255)>>>0<(g&65535)>>>0){break}we(e,15256);i=h;return}}while(0);l=j|0;a[l]=f;Oe(e,1920,l,1);i=h;return}if((g&2|0)==0){f=b[f+8>>1]|0;if((f&65535|0)<(1<<d[e+387|0]|0)){l=j|0;a[l]=(f&65535)>>>8;a[j+1|0]=f;Oe(e,1920,l,2);i=h;return}else{we(e,15072);i=h;return}}l=j|0;m=b[f+2>>1]|0;g=(m&65535)>>>8;a[l]=g;a[j+1|0]=m;m=b[f+4>>1]|0;k=(m&65535)>>>8;a[j+2|0]=k;a[j+3|0]=m;m=b[f+6>>1]|0;f=(m&65535)>>>8;a[j+4|0]=f;a[j+5|0]=m;do{if((a[e+387|0]|0)==8){if((k|g|f)<<16>>16==0){break}we(e,15176);i=h;return}}while(0);Oe(e,1920,l,6);i=h;return}function cf(f,g,h){f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+24|0;k=j|0;l=j+8|0;m=j+16|0;if((e[f+372>>1]|0|0)<(h|0)){we(f,14984);i=j;return}n=l|0;a[n]=h>>>23;a[l+1|0]=h>>>15;a[l+2|0]=h>>>7;a[l+3|0]=h<<1;l=l+4|0;D=d[1896]|d[1897]<<8|d[1898]<<16|d[1899]<<24|0;a[l]=D;D=D>>8;a[l+1|0]=D;D=D>>8;a[l+2|0]=D;D=D>>8;a[l+3|0]=D;qf(f,n,8);n=f+376|0;D=d[1896]|d[1897]<<8|d[1898]<<16|d[1899]<<24|0;a[n]=D;D=D>>8;a[n+1|0]=D;D=D>>8;a[n+2|0]=D;D=D>>8;a[n+3|0]=D;Qd(f);Rd(f,1896,4);if((h|0)>0){l=m|0;m=m+1|0;n=0;do{o=b[g+(n<<1)>>1]|0;a[l]=(o&65535)>>>8;a[m]=o;qf(f,l,2);Rd(f,l,2);n=n+1|0;}while((n|0)<(h|0))}o=k|0;n=c[f+364>>2]|0;a[o]=n>>>24;a[k+1|0]=n>>>16;a[k+2|0]=n>>>8;a[k+3|0]=n;qf(f,o,4);i=j;return}function df(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;i=i+24|0;h=g|0;m=g+8|0;k=g+16|0;e=We(b,e,k)|0;if((e|0)==0){i=g;return}l=(f|0)==0;do{if(l){j=0}else{if((a[f]|0)==0){j=0;break}j=Mp(f|0)|0}}while(0);n=e+1|0;p=n+j|0;o=m|0;e=(b|0)==0;if(!e){a[o]=p>>>24;a[m+1|0]=p>>>16;a[m+2|0]=p>>>8;a[m+3|0]=p;p=m+4|0;D=d[1672]|d[1673]<<8|d[1674]<<16|d[1675]<<24|0;a[p]=D;D=D>>8;a[p+1|0]=D;D=D>>8;a[p+2|0]=D;D=D>>8;a[p+3|0]=D;qf(b,o,8);p=b+376|0;D=d[1672]|d[1673]<<8|d[1674]<<16|d[1675]<<24|0;a[p]=D;D=D>>8;a[p+1|0]=D;D=D>>8;a[p+2|0]=D;D=D>>8;a[p+3|0]=D;Qd(b);Rd(b,1672,4)}k=c[k>>2]|0;if(!(e|(k|0)==0|(n|0)==0)){qf(b,k,n);Rd(b,k,n)}if(!((j|0)==0|(e|l))){qf(b,f,j);Rd(b,f,j)}f=h|0;if(!e){p=c[b+364>>2]|0;a[f]=p>>>24;a[h+1|0]=p>>>16;a[h+2|0]=p>>>8;a[h+3|0]=p;qf(b,f,4)}re(b,k);i=g;return}function ef(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;i=i+56|0;g=j|0;n=j+8|0;l=j+16|0;m=j+24|0;k=j+32|0;Pp(k|0,0,20)|0;e=We(b,e,m)|0;if((e|0)==0){re(b,c[m>>2]|0);i=j;return}do{if((f|0)!=0){if((a[f]|0)==0|(h|0)==-1){break}o=e+2+(Xe(b,f,Mp(f|0)|0,h,k)|0)|0;p=n|0;f=(b|0)==0;if(!f){a[p]=o>>>24;a[n+1|0]=o>>>16;a[n+2|0]=o>>>8;a[n+3|0]=o;o=n+4|0;D=d[1648]|d[1649]<<8|d[1650]<<16|d[1651]<<24|0;a[o]=D;D=D>>8;a[o+1|0]=D;D=D>>8;a[o+2|0]=D;D=D>>8;a[o+3|0]=D;qf(b,p,8);p=b+376|0;D=d[1648]|d[1649]<<8|d[1650]<<16|d[1651]<<24|0;a[p]=D;D=D>>8;a[p+1|0]=D;D=D>>8;a[p+2|0]=D;D=D>>8;a[p+3|0]=D;Qd(b);Rd(b,1648,4)}m=c[m>>2]|0;e=e+1|0;if(!(f|(m|0)==0|(e|0)==0)){qf(b,m,e);Rd(b,m,e)}re(b,m);l=l|0;a[l]=h;if(f){Ye(0,k);}else{qf(b,l,1);Rd(b,l,1);Ye(b,k);p=g|0;o=c[b+364>>2]|0;a[p]=o>>>24;a[g+1|0]=o>>>16;a[g+2|0]=o>>>8;a[g+3|0]=o;qf(b,p,4)}i=j;return}}while(0);p=c[m>>2]|0;df(b,p,f,0);re(b,p);i=j;return}function ff(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;if((e|0)>1){we(b,13968)}h=g|0;a[h]=c>>>24;a[g+1|0]=c>>>16;a[g+2|0]=c>>>8;a[g+3|0]=c;a[g+4|0]=d>>>24;a[g+5|0]=d>>>16;a[g+6|0]=d>>>8;a[g+7|0]=d;a[g+8|0]=e;Oe(b,1856,h,9);i=f;return}function gf(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;n=i;i=i+40|0;m=n|0;s=n+8|0;p=n+16|0;u=n+32|0;if((h|0)>3){we(b,13912)}z=We(b,e,u)|0;t=z+1|0;r=(Mp(k|0)|0)+((j|0)!=0)|0;z=z+11+r|0;e=qe(b,j<<2)|0;o=e;q=(j|0)>0;v=z&255;y=z>>>8&255;x=z>>>16&255;w=z>>>24&255;if(q){v=j-1|0;w=0;do{A=(Mp(c[l+(w<<2)>>2]|0)|0)+((w|0)!=(v|0))|0;c[o+(w<<2)>>2]=A;z=A+z|0;w=w+1|0;}while((w|0)<(j|0));w=z>>>24&255;x=z>>>16&255;y=z>>>8&255;A=z&255}else{A=v}z=s|0;v=(b|0)==0;if(!v){a[z]=w;a[s+1|0]=x;a[s+2|0]=y;a[s+3|0]=A;A=s+4|0;D=d[1848]|d[1849]<<8|d[1850]<<16|d[1851]<<24|0;a[A]=D;D=D>>8;a[A+1|0]=D;D=D>>8;a[A+2|0]=D;D=D>>8;a[A+3|0]=D;qf(b,z,8);A=b+376|0;D=d[1848]|d[1849]<<8|d[1850]<<16|d[1851]<<24|0;a[A]=D;D=D>>8;a[A+1|0]=D;D=D>>8;a[A+2|0]=D;D=D>>8;a[A+3|0]=D;Qd(b);Rd(b,1848,4)}s=c[u>>2]|0;if(!(v|(s|0)==0|(t|0)==0)){qf(b,s,t);Rd(b,s,t)}t=p|0;a[t]=f>>>24;a[p+1|0]=f>>>16;a[p+2|0]=f>>>8;a[p+3|0]=f;a[p+4|0]=g>>>24;a[p+5|0]=g>>>16;a[p+6|0]=g>>>8;a[p+7|0]=g;a[p+8|0]=h;a[p+9|0]=j;do{if(!v){qf(b,t,10);Rd(b,t,10);if((k|0)==0|(r|0)==0){break}qf(b,k,r);Rd(b,k,r)}}while(0);re(b,s);if(!(v|q^1)){k=0;do{g=c[l+(k<<2)>>2]|0;f=c[o+(k<<2)>>2]|0;if(!((g|0)==0|(f|0)==0)){qf(b,g,f);Rd(b,g,f)}k=k+1|0;}while((k|0)<(j|0))}re(b,e);j=m|0;if(v){i=n;return}A=c[b+364>>2]|0;a[j]=A>>>24;a[m+1|0]=A>>>16;a[m+2|0]=A>>>8;a[m+3|0]=A;qf(b,j,4);i=n;return}function hf(b,c,d,e){b=b|0;c=c|0;d=+d;e=+e;var f=0,g=0,j=0,k=0;f=i;i=i+64|0;g=f|0;j=g|0;a[j]=c;k=g+1|0;gb(k|0,63,13896,(c=i,i=i+8|0,h[c>>3]=d,c)|0)|0;i=c;k=Mp(k|0)|0;c=k+2|0;g=g+c|0;gb(g|0,62-k|0,13896,(k=i,i=i+8|0,h[k>>3]=e,k)|0)|0;i=k;Oe(b,1696,j,(Mp(g|0)|0)+c|0);i=f;return}function jf(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;if((e|0)>1){we(b,13784)}h=g|0;a[h]=c>>>24;a[g+1|0]=c>>>16;a[g+2|0]=c>>>8;a[g+3|0]=c;a[g+4|0]=d>>>24;a[g+5|0]=d>>>16;a[g+6|0]=d>>>8;a[g+7|0]=d;a[g+8|0]=e;Oe(b,1840,h,9);i=f;return}function kf(c,d){c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;e=i;i=i+8|0;f=e|0;g=a[d+2|0]|0;do{if(!((g&255)>>>0>12>>>0|g<<24>>24==0)){h=a[d+3|0]|0;if((h&255)>>>0>31>>>0|h<<24>>24==0){break}j=a[d+4|0]|0;if((j&255)>>>0>23>>>0){break}k=a[d+6|0]|0;if((k&255)>>>0>60>>>0){break}l=f|0;m=b[d>>1]|0;a[l]=(m&65535)>>>8;a[f+1|0]=m;a[f+2|0]=g;a[f+3|0]=h;a[f+4|0]=j;a[f+5|0]=a[d+5|0]|0;a[f+6|0]=k;Oe(c,1664,l,7);i=e;return}}while(0);we(c,13736);i=e;return}function lf(b){b=b|0;var e=0,f=0,g=0,h=0;f=ha(d[b+388|0]|0,d[b+391|0]|0)|0;e=b+292|0;g=c[e>>2]|0;if(f>>>0>7>>>0){f=ha(f>>>3,g)|0}else{f=((ha(f,g)|0)+7|0)>>>3}g=f+1|0;f=qe(b,g)|0;c[b+328>>2]=f;a[f]=0;f=b+385|0;h=a[f]|0;if((h&16)!=0){h=qe(b,(c[b+308>>2]|0)+1|0)|0;c[b+332>>2]=h;a[h]=1;h=a[f]|0}do{if((h&255)>>>0>31>>>0){h=qe(b,g)|0;c[b+324>>2]=h;Pp(h|0,0,g|0)|0;g=a[f]|0;if((g&32)!=0){g=qe(b,(c[b+308>>2]|0)+1|0)|0;c[b+336>>2]=g;a[g]=2;g=a[f]|0}if((g&64)!=0){g=qe(b,(c[b+308>>2]|0)+1|0)|0;c[b+340>>2]=g;a[g]=3;g=a[f]|0}if(g<<24>>24>=0){break}h=qe(b,(c[b+308>>2]|0)+1|0)|0;c[b+344>>2]=h;a[h]=4}}while(0);if((a[b+383|0]|0)==0){c[b+300>>2]=c[b+296>>2];c[b+304>>2]=c[e>>2];h=b+268|0;h=c[h>>2]|0;g=b+224|0;c[g>>2]=h;g=b+264|0;g=c[g>>2]|0;h=b+220|0;c[h>>2]=g;return}f=c[b+296>>2]|0;if((c[b+204>>2]&2|0)==0){h=c[436]|0;c[b+300>>2]=((f-1+h-(c[428]|0)|0)>>>0)/(h>>>0)|0;h=c[452]|0;c[b+304>>2]=(((c[e>>2]|0)-1+h-(c[444]|0)|0)>>>0)/(h>>>0)|0;h=b+268|0;h=c[h>>2]|0;g=b+224|0;c[g>>2]=h;g=b+264|0;g=c[g>>2]|0;h=b+220|0;c[h>>2]=g;return}else{c[b+300>>2]=f;c[b+304>>2]=c[e>>2];h=b+268|0;h=c[h>>2]|0;g=b+224|0;c[g>>2]=h;g=b+264|0;g=c[g>>2]|0;h=b+220|0;c[h>>2]=g;return}}function mf(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b+320|0;l=(c[f>>2]|0)+1|0;c[f>>2]=l;e=b+300|0;if(l>>>0<(c[e>>2]|0)>>>0){return}a:do{if((a[b+383|0]|0)!=0){c[f>>2]=0;if((c[b+204>>2]&2|0)==0){k=b+292|0;h=b+384|0;f=b+304|0;g=b+296|0;i=a[h]|0;do{i=i+1&255;a[h]=i;j=i&255;if((i&255)>>>0>6>>>0){break a}m=c[1808+(j<<2)>>2]|0;m=(((c[k>>2]|0)-1+m-(c[1776+(j<<2)>>2]|0)|0)>>>0)/(m>>>0)|0;c[f>>2]=m;l=c[1744+(j<<2)>>2]|0;l=(((c[g>>2]|0)-1+l-(c[1712+(j<<2)>>2]|0)|0)>>>0)/(l>>>0)|0;c[e>>2]=l;}while((m|0)==0|(l|0)==0)}else{l=b+384|0;m=(a[l]|0)+1&255;a[l]=m;if((m&255)>>>0>=7>>>0){break}}e=c[b+324>>2]|0;if((e|0)==0){return}f=ha(d[b+388|0]|0,d[b+391|0]|0)|0;b=c[b+292>>2]|0;if(f>>>0>7>>>0){b=ha(f>>>3,b)|0}else{b=((ha(f,b)|0)+7|0)>>>3}Pp(e|0,0,b+1|0)|0;return}}while(0);e=b+208|0;l=b+232|0;j=b+224|0;f=b+264|0;g=b+268|0;k=b+220|0;while(1){i=zf(e,4)|0;if((i|0)==0){if((c[j>>2]|0)!=0){continue}Re(b,c[f>>2]|0,c[g>>2]|0);c[k>>2]=c[f>>2];c[j>>2]=c[g>>2];continue}else if((i|0)==1){break}h=c[l>>2]|0;if((h|0)==0){ve(b,13664)}else{ve(b,h)}if((i|0)==1){break}}h=c[j>>2]|0;g=c[g>>2]|0;if(h>>>0<g>>>0){Re(b,c[f>>2]|0,g-h|0)}yf(e)|0;c[b+252>>2]=0;return}function nf(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((f|0)>=6){return}g=b+11|0;h=d[g]|0;do{if((h|0)==4){i=c[b>>2]|0;h=c[1776+(f<<2)>>2]|0;if(h>>>0>=i>>>0){break}j=c[1808+(f<<2)>>2]|0;k=e;m=4;n=0;l=h;do{n=((d[e+(l>>>1)|0]|0)>>>((l<<2&4^4)>>>0)&15)<<m|n;if((m|0)==0){a[k]=n;n=0;m=4;k=k+1|0}else{m=m-4|0}l=j+l|0;}while(l>>>0<i>>>0);if((m|0)==4){break}a[k]=n}else if((h|0)==1){j=c[b>>2]|0;h=c[1776+(f<<2)>>2]|0;if(h>>>0>=j>>>0){break}i=c[1808+(f<<2)>>2]|0;k=h;n=0;m=7;l=e;do{n=((d[e+(k>>>3)|0]|0)>>>((k&7^7)>>>0)&1)<<m|n;if((m|0)==0){a[l]=n;l=l+1|0;m=7;n=0}else{m=m-1|0}k=i+k|0;}while(k>>>0<j>>>0);if((m|0)==7){break}a[l]=n}else if((h|0)==2){j=c[b>>2]|0;h=c[1776+(f<<2)>>2]|0;if(h>>>0>=j>>>0){break}i=c[1808+(f<<2)>>2]|0;k=h;n=0;m=6;l=e;do{n=((d[e+(k>>>2)|0]|0)>>>((k<<1&6^6)>>>0)&3)<<m|n;if((m|0)==0){a[l]=n;l=l+1|0;m=6;n=0}else{m=m-2|0}k=i+k|0;}while(k>>>0<j>>>0);if((m|0)==6){break}a[l]=n}else{i=c[b>>2]|0;j=h>>>3;h=c[1776+(f<<2)>>2]|0;if(h>>>0>=i>>>0){break}l=c[1808+(f<<2)>>2]|0;k=e;m=h;while(1){n=e+(ha(m,j)|0)|0;if((k|0)!=(n|0)){Np(k|0,n|0,j)|0}m=l+m|0;if(m>>>0<i>>>0){k=k+j|0}else{break}}}}while(0);n=b|0;f=c[1808+(f<<2)>>2]|0;f=(((c[n>>2]|0)-1+f-h|0)>>>0)/(f>>>0)|0;c[n>>2]=f;n=a[g]|0;g=n&255;if((n&255)>>>0>7>>>0){g=ha(g>>>3,f)|0}else{g=((ha(g,f)|0)+7|0)>>>3}c[b+4>>2]=g;return}function of(b,f){b=b|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;m=a[b+385|0]|0;j=c[f+4>>2]|0;i=b+597|0;h=a[i]|0;g=h&255;f=((d[f+11|0]|0)+7|0)>>>3;l=c[b+324>>2]|0;k=c[b+328>>2]|0;n=m&255;do{if((n&8|0)==0|m<<24>>24==8){o=2147483647}else{if((j|0)==0){o=0}else{p=0;o=0;q=k;do{q=q+1|0;C=a[q]|0;r=C&255;o=(C<<24>>24>-1?r:256-r|0)+o|0;p=p+1|0;}while(p>>>0<j>>>0)}if((a[b+596|0]|0)!=2){break}s=o&65535;r=o>>>10&4194240;if(h<<24>>24!=0){o=c[b+600>>2]|0;p=b+604|0;q=0;do{if((a[o+q|0]|0)==0){C=e[(c[p>>2]|0)+(q<<1)>>1]|0;r=(ha(C,r)|0)>>>8;s=(ha(C,s)|0)>>>8}q=q+1|0;}while((q|0)<(g|0))}o=e[c[b+612>>2]>>1]|0;p=ha(o,r)|0;if(p>>>0>33553927>>>0){o=2147483647;break}o=(p>>>3<<10)+((ha(o,s)|0)>>>3)|0}}while(0);do{if(m<<24>>24==16){q=k+1|0;p=b+332|0;s=c[p>>2]|0;t=s+1|0;if((f|0)==0){u=0;r=q;s=t}else{r=f+1|0;s=s+r|0;v=0;u=q;while(1){a[t]=a[u]|0;v=v+1|0;if(v>>>0<f>>>0){u=u+1|0;t=t+1|0}else{break}}u=f;r=k+r|0}if(u>>>0<j>>>0){t=u;while(1){a[s]=(a[r]|0)-(a[q]|0);t=t+1|0;if(t>>>0<j>>>0){s=s+1|0;q=q+1|0;r=r+1|0}else{break}}}p=c[p>>2]|0}else{if((n&16|0)==0){p=k;break}q=b+596|0;do{if((a[q]|0)==2){t=o&65535;u=o>>>10&4194240;if(h<<24>>24!=0){r=c[b+600>>2]|0;p=b+608|0;s=0;do{if((a[r+s|0]|0)==1){C=e[(c[p>>2]|0)+(s<<1)>>1]|0;t=(ha(C,t)|0)>>>8;u=(ha(C,u)|0)>>>8}s=s+1|0;}while((s|0)<(g|0))}p=e[(c[b+616>>2]|0)+2>>1]|0;r=ha(p,u)|0;if(r>>>0>33553927>>>0){r=2147483647;break}r=(r>>>3<<10)+((ha(p,t)|0)>>>3)|0}else{r=o}}while(0);s=k+1|0;p=b+332|0;t=c[p>>2]|0;w=t+1|0;if((f|0)==0){u=s;x=0;v=0;t=w}else{u=f+1|0;t=t+u|0;v=s;x=0;y=0;while(1){C=a[v]|0;a[w]=C;z=C&255;x=(C<<24>>24>-1?z:256-z|0)+x|0;y=y+1|0;if(y>>>0<f>>>0){v=v+1|0;w=w+1|0}else{break}}u=k+u|0;v=f}a:do{if(v>>>0<j>>>0){while(1){w=(d[u]|0)-(d[s]|0)|0;a[t]=w;w=w&255;x=(w>>>0<128>>>0?w:256-w|0)+x|0;if(x>>>0>r>>>0){break a}v=v+1|0;if(v>>>0<j>>>0){u=u+1|0;t=t+1|0;s=s+1|0}else{break}}}}while(0);do{if((a[q]|0)==2){t=x&65535;u=x>>>10&4194240;if(h<<24>>24!=0){r=c[b+600>>2]|0;q=b+608|0;s=0;do{if((a[r+s|0]|0)==1){C=e[(c[q>>2]|0)+(s<<1)>>1]|0;t=(ha(C,t)|0)>>>8;u=(ha(C,u)|0)>>>8}s=s+1|0;}while((s|0)<(g|0))}q=e[(c[b+616>>2]|0)+2>>1]|0;r=ha(q,u)|0;if(r>>>0>33553927>>>0){x=2147483647;break}x=(r>>>3<<10)+((ha(q,t)|0)>>>3)|0}}while(0);if(x>>>0>=o>>>0){p=k;break}p=c[p>>2]|0;o=x}}while(0);do{if(m<<24>>24==32){p=b+336|0;if((j|0)!=0){q=0;t=l;s=c[p>>2]|0;r=k;do{t=t+1|0;s=s+1|0;r=r+1|0;a[s]=(a[r]|0)-(a[t]|0);q=q+1|0;}while(q>>>0<j>>>0)}p=c[p>>2]|0}else{if((n&32|0)==0){break}r=b+596|0;do{if((a[r]|0)==2){u=o&65535;v=o>>>10&4194240;if(h<<24>>24!=0){q=c[b+600>>2]|0;s=b+608|0;t=0;do{if((a[q+t|0]|0)==2){C=e[(c[s>>2]|0)+(t<<1)>>1]|0;u=(ha(C,u)|0)>>>8;v=(ha(C,v)|0)>>>8}t=t+1|0;}while((t|0)<(g|0))}q=e[(c[b+616>>2]|0)+4>>1]|0;s=ha(q,v)|0;if(s>>>0>33553927>>>0){s=2147483647;break}s=(s>>>3<<10)+((ha(q,u)|0)>>>3)|0}else{s=o}}while(0);q=b+336|0;if((j|0)==0){x=0}else{x=0;t=0;w=l;v=c[q>>2]|0;u=k;do{w=w+1|0;v=v+1|0;u=u+1|0;y=(d[u]|0)-(d[w]|0)|0;a[v]=y;y=y&255;x=(y>>>0<128>>>0?y:256-y|0)+x|0;t=t+1|0;}while(x>>>0<=s>>>0&t>>>0<j>>>0)}do{if((a[r]|0)==2){u=x&65535;v=x>>>10&4194240;if(h<<24>>24!=0){s=c[b+600>>2]|0;r=b+604|0;t=0;do{if((a[s+t|0]|0)==2){C=e[(c[r>>2]|0)+(t<<1)>>1]|0;u=(ha(C,u)|0)>>>8;v=(ha(C,v)|0)>>>8}t=t+1|0;}while((t|0)<(g|0))}r=e[(c[b+612>>2]|0)+4>>1]|0;s=ha(r,v)|0;if(s>>>0>33553927>>>0){x=2147483647;break}x=(s>>>3<<10)+((ha(r,u)|0)>>>3)|0}}while(0);if(x>>>0>=o>>>0){break}p=c[q>>2]|0;o=x}}while(0);do{if(m<<24>>24==64){q=k+1|0;p=b+340|0;t=c[p>>2]|0;w=l+1|0;v=t+1|0;if((f|0)==0){x=q;s=0;u=w}else{r=f+1|0;u=l+r|0;s=q;x=0;while(1){a[v]=(a[s]|0)-((d[w]|0)>>>1);x=x+1|0;if(x>>>0<f>>>0){s=s+1|0;w=w+1|0;v=v+1|0}else{break}}x=k+r|0;s=f;v=t+r|0}if(s>>>0<j>>>0){r=x;while(1){a[v]=(d[r]|0)-(((d[q]|0)+(d[u]|0)|0)>>>1);s=s+1|0;if(s>>>0<j>>>0){r=r+1|0;v=v+1|0;u=u+1|0;q=q+1|0}else{break}}}p=c[p>>2]|0}else{if((n&64|0)==0){break}r=b+596|0;do{if((a[r]|0)==2){u=o&65535;v=o>>>10&4194240;if(h<<24>>24!=0){s=c[b+600>>2]|0;q=b+608|0;t=0;do{if((a[s+t|0]|0)==3){C=e[(c[q>>2]|0)+(t<<1)>>1]|0;u=(ha(C,u)|0)>>>8;v=(ha(C,v)|0)>>>8}t=t+1|0;}while((t|0)<(g|0))}q=e[(c[b+616>>2]|0)+6>>1]|0;s=ha(q,v)|0;if(s>>>0>33553927>>>0){s=2147483647;break}s=(s>>>3<<10)+((ha(q,u)|0)>>>3)|0}else{s=o}}while(0);t=k+1|0;q=b+340|0;v=c[q>>2]|0;A=l+1|0;z=v+1|0;if((f|0)==0){B=t;y=0;x=0;w=A}else{u=f+1|0;w=l+u|0;x=t;y=0;B=0;while(1){C=(d[x]|0)-((d[A]|0)>>>1)|0;a[z]=C;C=C&255;y=(C>>>0<128>>>0?C:256-C|0)+y|0;B=B+1|0;if(B>>>0<f>>>0){x=x+1|0;A=A+1|0;z=z+1|0}else{break}}B=k+u|0;x=f;z=v+u|0}b:do{if(x>>>0<j>>>0){u=B;while(1){v=(d[u]|0)-(((d[t]|0)+(d[w]|0)|0)>>>1)|0;a[z]=v;v=v&255;y=(v>>>0<128>>>0?v:256-v|0)+y|0;if(y>>>0>s>>>0){break b}x=x+1|0;if(x>>>0<j>>>0){u=u+1|0;z=z+1|0;w=w+1|0;t=t+1|0}else{break}}}}while(0);do{if((a[r]|0)==2){u=y&65535;v=y>>>10&4194240;if(h<<24>>24!=0){r=c[b+600>>2]|0;s=b+604|0;t=0;do{if((a[r+t|0]|0)==0){C=e[(c[s>>2]|0)+(t<<1)>>1]|0;u=(ha(C,u)|0)>>>8;v=(ha(C,v)|0)>>>8}t=t+1|0;}while((t|0)<(g|0))}r=e[(c[b+612>>2]|0)+6>>1]|0;s=ha(r,v)|0;if(s>>>0>33553927>>>0){y=2147483647;break}y=(s>>>3<<10)+((ha(r,u)|0)>>>3)|0}}while(0);if(y>>>0>=o>>>0){break}p=c[q>>2]|0;o=y}}while(0);do{if(m<<24>>24==-128){n=k+1|0;m=b+344|0;q=c[m>>2]|0;o=l+1|0;s=q+1|0;if((f|0)==0){k=n;p=o;f=0;l=s}else{r=f+1|0;p=l+r|0;l=n;t=o;u=0;while(1){a[s]=(a[l]|0)-(a[t]|0);u=u+1|0;if(u>>>0<f>>>0){l=l+1|0;t=t+1|0;s=s+1|0}else{break}}k=k+r|0;l=q+r|0}if(f>>>0<j>>>0){while(1){q=a[p]|0;r=a[o]|0;w=r&255;s=a[n]|0;v=(q&255)-w|0;w=(s&255)-w|0;t=(v|0)<0?-v|0:v;u=(w|0)<0?-w|0:w;v=w+v|0;v=(v|0)<0?-v|0:v;if((t|0)>(u|0)|(t|0)>(v|0)){s=(u|0)<=(v|0)?q:r}a[l]=(a[k]|0)-s;f=f+1|0;if(f>>>0<j>>>0){k=k+1|0;l=l+1|0;p=p+1|0;o=o+1|0;n=n+1|0}else{break}}}p=c[m>>2]|0}else{if((n&128|0)==0){break}n=b+596|0;do{if((a[n]|0)==2){s=o&65535;t=o>>>10&4194240;if(h<<24>>24!=0){m=c[b+600>>2]|0;q=b+608|0;r=0;do{if((a[m+r|0]|0)==4){C=e[(c[q>>2]|0)+(r<<1)>>1]|0;s=(ha(C,s)|0)>>>8;t=(ha(C,t)|0)>>>8}r=r+1|0;}while((r|0)<(g|0))}m=e[(c[b+616>>2]|0)+8>>1]|0;q=ha(m,t)|0;if(q>>>0>33553927>>>0){q=2147483647;break}q=(q>>>3<<10)+((ha(m,s)|0)>>>3)|0}else{q=o}}while(0);r=k+1|0;m=b+344|0;v=c[m>>2]|0;s=l+1|0;w=v+1|0;if((f|0)==0){k=r;t=s;x=0;f=0;l=w}else{u=f+1|0;t=l+u|0;x=r;l=s;y=0;z=0;while(1){A=(d[x]|0)-(d[l]|0)|0;a[w]=A;A=A&255;y=(A>>>0<128>>>0?A:256-A|0)+y|0;z=z+1|0;if(z>>>0<f>>>0){x=x+1|0;l=l+1|0;w=w+1|0}else{break}}k=k+u|0;x=y;l=v+u|0}c:do{if(f>>>0<j>>>0){u=x;while(1){x=d[t]|0;w=d[s]|0;z=d[r]|0;A=x-w|0;B=z-w|0;v=(A|0)<0?-A|0:A;y=(B|0)<0?-B|0:B;A=B+A|0;A=(A|0)<0?-A|0:A;if((v|0)>(y|0)|(v|0)>(A|0)){z=(y|0)<=(A|0)?x:w}v=(d[k]|0)-z|0;a[l]=v;v=v&255;u=(v>>>0<128>>>0?v:256-v|0)+u|0;if(u>>>0>q>>>0){break c}f=f+1|0;if(f>>>0<j>>>0){k=k+1|0;l=l+1|0;t=t+1|0;s=s+1|0;r=r+1|0}else{break}}}else{u=x}}while(0);do{if((a[n]|0)==2){l=u&65535;n=u>>>10&4194240;if(h<<24>>24!=0){j=c[b+600>>2]|0;f=b+604|0;k=0;do{if((a[j+k|0]|0)==4){C=e[(c[f>>2]|0)+(k<<1)>>1]|0;l=(ha(C,l)|0)>>>8;n=(ha(C,n)|0)>>>8}k=k+1|0;}while((k|0)<(g|0))}j=e[(c[b+612>>2]|0)+8>>1]|0;f=ha(j,n)|0;if(f>>>0>33553927>>>0){u=2147483647;break}u=(f>>>3<<10)+((ha(j,l)|0)>>>3)|0}}while(0);if(u>>>0>=o>>>0){break}p=c[m>>2]|0}}while(0);pf(b,p);if((a[i]|0)==0){return}b=b+600|0;if((h&255)>>>0>1>>>0){h=g>>>0>2>>>0;i=1;do{C=c[b>>2]|0;a[C+i|0]=a[C+(i-1)|0]|0;i=i+1|0;}while((i|0)<(g|0));g=h?g:2}else{g=1}a[(c[b>>2]|0)+g|0]=a[p]|0;return}function pf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;d=a+208|0;c[d>>2]=b;j=a+212|0;c[j>>2]=(c[a+352>>2]|0)+1;f=a+224|0;h=a+264|0;b=a+268|0;e=a+220|0;g=a+232|0;do{do{if((zf(d,0)|0)!=0){i=c[g>>2]|0;if((i|0)==0){ve(a,13664);break}else{ve(a,i);break}}}while(0);if((c[f>>2]|0)==0){Re(a,c[h>>2]|0,c[b>>2]|0);c[e>>2]=c[h>>2];c[f>>2]=c[b>>2]}}while((c[j>>2]|0)!=0);b=a+324|0;d=c[b>>2]|0;if((d|0)!=0){j=a+328|0;c[b>>2]=c[j>>2];c[j>>2]=d}mf(a);j=a+432|0;i=(c[j>>2]|0)+1|0;c[j>>2]=i;j=c[a+428>>2]|0;if((j|0)==0|i>>>0<j>>>0){return}ee(a);return}function qf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[a+168>>2]|0;if((e|0)==0){ve(a,13416);return}else{Qc[e&31](a,b,d);return}}function rf(a,b,d){a=a|0;b=b|0;d=d|0;if((a|0)==0){return}if((Ua(b|0,1,d|0,c[a+176>>2]|0)|0)==(d|0)){return}ve(a,16848);return}function sf(a){a=a|0;var b=0;b=c[a+424>>2]|0;if((b|0)==0){return}yc[b&511](a);return}function tf(a){a=a|0;if((a|0)==0){return}Sa(c[a+176>>2]|0)|0;return}function uf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if((a|0)==0){return}c[a+176>>2]=b;if((d|0)==0){d=2}else{}c[a+168>>2]=d;c[a+424>>2]=(e|0)==0?218:e;e=a+172|0;if((c[e>>2]|0)==0){return}c[e>>2]=0;we(a,15552);we(a,14440);return}function vf(a,b,e){a=a|0;b=b|0;e=e|0;var f=0;if((b|0)==0){f=0;return f|0}a=~a;a:do{if((e|0)!=0){while(1){if((b&3|0)==0){break}a=c[2832+(((d[b]|0)^a&255)<<2)>>2]^a>>>8;e=e-1|0;if((e|0)==0){break a}else{b=b+1|0}}if(e>>>0>31>>>0){f=b;while(1){a=c[f>>2]^a;a=c[4880+((a>>>8&255)<<2)>>2]^c[5904+((a&255)<<2)>>2]^c[3856+((a>>>16&255)<<2)>>2]^c[2832+(a>>>24<<2)>>2]^c[f+4>>2];a=c[4880+((a>>>8&255)<<2)>>2]^c[5904+((a&255)<<2)>>2]^c[3856+((a>>>16&255)<<2)>>2]^c[2832+(a>>>24<<2)>>2]^c[f+8>>2];a=c[4880+((a>>>8&255)<<2)>>2]^c[5904+((a&255)<<2)>>2]^c[3856+((a>>>16&255)<<2)>>2]^c[2832+(a>>>24<<2)>>2]^c[f+12>>2];a=c[4880+((a>>>8&255)<<2)>>2]^c[5904+((a&255)<<2)>>2]^c[3856+((a>>>16&255)<<2)>>2]^c[2832+(a>>>24<<2)>>2]^c[f+16>>2];a=c[4880+((a>>>8&255)<<2)>>2]^c[5904+((a&255)<<2)>>2]^c[3856+((a>>>16&255)<<2)>>2]^c[2832+(a>>>24<<2)>>2]^c[f+20>>2];a=c[4880+((a>>>8&255)<<2)>>2]^c[5904+((a&255)<<2)>>2]^c[3856+((a>>>16&255)<<2)>>2]^c[2832+(a>>>24<<2)>>2]^c[f+24>>2];b=f+32|0;a=c[4880+((a>>>8&255)<<2)>>2]^c[5904+((a&255)<<2)>>2]^c[3856+((a>>>16&255)<<2)>>2]^c[2832+(a>>>24<<2)>>2]^c[f+28>>2];a=c[4880+((a>>>8&255)<<2)>>2]^c[5904+((a&255)<<2)>>2]^c[3856+((a>>>16&255)<<2)>>2]^c[2832+(a>>>24<<2)>>2];e=e-32|0;if(e>>>0>31>>>0){f=b}else{break}}}if(e>>>0>3>>>0){f=a;while(1){a=b+4|0;f=c[b>>2]^f;f=c[4880+((f>>>8&255)<<2)>>2]^c[5904+((f&255)<<2)>>2]^c[3856+((f>>>16&255)<<2)>>2]^c[2832+(f>>>24<<2)>>2];e=e-4|0;if(e>>>0>3>>>0){b=a}else{b=a;break}}}else{f=a}if((e|0)==0){a=f;break}a=f;while(1){a=c[2832+(((d[b]|0)^a&255)<<2)>>2]^a>>>8;e=e-1|0;if((e|0)==0){break}else{b=b+1|0}}}}while(0);f=~a;return f|0}function wf(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0;if((i|0)==0){m=-6;return m|0}if(!((a[i]|0)==49&(j|0)==56)){m=-6;return m|0}if((b|0)==0){m=-2;return m|0}j=b+24|0;c[j>>2]=0;i=b+32|0;k=c[i>>2]|0;if((k|0)==0){c[i>>2]=62;c[b+40>>2]=0;k=62}l=b+36|0;if((c[l>>2]|0)==0){c[l>>2]=4}d=(d|0)==-1?6:d;if((f|0)<0){l=0;f=-f|0}else{m=(f|0)>15;l=m?2:1;f=m?f-16|0:f}if(!((g-1|0)>>>0<9>>>0&(e|0)==8)){m=-2;return m|0}if((f-8|0)>>>0>7>>>0|d>>>0>9>>>0|h>>>0>4>>>0){m=-2;return m|0}m=(f|0)==8?9:f;f=b+40|0;e=Cc[k&127](c[f>>2]|0,1,5824)|0;if((e|0)==0){m=-4;return m|0}c[b+28>>2]=e;c[e>>2]=b;c[e+24>>2]=l;c[e+28>>2]=0;c[e+48>>2]=m;k=1<<m;l=e+44|0;c[l>>2]=k;c[e+52>>2]=k-1;m=g+7|0;c[e+80>>2]=m;m=1<<m;n=e+76|0;c[n>>2]=m;c[e+84>>2]=m-1;c[e+88>>2]=((g+9|0)>>>0)/3|0;m=e+56|0;c[m>>2]=Cc[c[i>>2]&127](c[f>>2]|0,k,2)|0;k=e+64|0;c[k>>2]=Cc[c[i>>2]&127](c[f>>2]|0,c[l>>2]|0,2)|0;l=e+68|0;c[l>>2]=Cc[c[i>>2]&127](c[f>>2]|0,c[n>>2]|0,2)|0;g=1<<g+6;n=e+5788|0;c[n>>2]=g;f=Cc[c[i>>2]&127](c[f>>2]|0,g,4)|0;g=f;c[e+8>>2]=f;i=c[n>>2]|0;c[e+12>>2]=i<<2;do{if((c[m>>2]|0)!=0){if((c[k>>2]|0)==0){break}if((c[l>>2]|0)==0|(f|0)==0){break}c[e+5796>>2]=g+(i>>>1<<1);c[e+5784>>2]=f+(i*3|0);c[e+132>>2]=d;c[e+136>>2]=h;a[e+36|0]=8;n=yf(b)|0;return n|0}}while(0);c[e+4>>2]=666;c[j>>2]=c[8];xf(b)|0;n=-4;return n|0}function xf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;if((a|0)==0){g=-2;return g|0}b=a+28|0;f=c[b>>2]|0;if((f|0)==0){g=-2;return g|0}d=c[f+4>>2]|0;switch(d|0){case 666:case 113:case 103:case 91:case 73:case 69:case 42:{break};default:{g=-2;return g|0}}e=c[f+8>>2]|0;if((e|0)!=0){zc[c[a+36>>2]&127](c[a+40>>2]|0,e);f=c[b>>2]|0}e=c[f+68>>2]|0;if((e|0)!=0){zc[c[a+36>>2]&127](c[a+40>>2]|0,e);f=c[b>>2]|0}e=c[f+64>>2]|0;if((e|0)!=0){zc[c[a+36>>2]&127](c[a+40>>2]|0,e);f=c[b>>2]|0}g=c[f+56>>2]|0;e=a+36|0;if((g|0)==0){a=a+40|0}else{a=a+40|0;zc[c[e>>2]&127](c[a>>2]|0,g);f=c[b>>2]|0}zc[c[e>>2]&127](c[a>>2]|0,f);c[b>>2]=0;g=(d|0)==113?-3:0;return g|0}function yf(a){a=a|0;var d=0,f=0,g=0;if((a|0)==0){g=-2;return g|0}d=c[a+28>>2]|0;if((d|0)==0){g=-2;return g|0}if((c[a+32>>2]|0)==0){g=-2;return g|0}if((c[a+36>>2]|0)==0){g=-2;return g|0}c[a+20>>2]=0;c[a+8>>2]=0;c[a+24>>2]=0;c[a+44>>2]=2;c[d+20>>2]=0;c[d+16>>2]=c[d+8>>2];f=d+24|0;g=c[f>>2]|0;if((g|0)<0){g=-g|0;c[f>>2]=g}c[d+4>>2]=(g|0)!=0?42:113;if((g|0)==2){f=vf(0,0,0)|0}else{f=Rf(0,0,0)|0}c[a+48>>2]=f;c[d+40>>2]=0;Gf(d);c[d+60>>2]=c[d+44>>2]<<1;g=d+76|0;f=d+68|0;b[(c[f>>2]|0)+((c[g>>2]|0)-1<<1)>>1]=0;Pp(c[f>>2]|0,0,(c[g>>2]<<1)-2|0)|0;g=c[d+132>>2]|0;c[d+128>>2]=e[11026+(g*12|0)>>1]|0;c[d+140>>2]=e[11024+(g*12|0)>>1]|0;c[d+144>>2]=e[11028+(g*12|0)>>1]|0;c[d+124>>2]=e[11030+(g*12|0)>>1]|0;c[d+108>>2]=0;c[d+92>>2]=0;c[d+116>>2]=0;c[d+120>>2]=2;c[d+96>>2]=2;c[d+104>>2]=0;c[d+72>>2]=0;g=0;return g|0}function zf(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;if((d|0)==0){x=-2;return x|0}f=d+28|0;i=c[f>>2]|0;if((i|0)==0|e>>>0>4>>>0){x=-2;return x|0}g=d+12|0;do{if((c[g>>2]|0)!=0){if((c[d>>2]|0)==0){if((c[d+4>>2]|0)!=0){break}}l=i+4|0;o=c[l>>2]|0;j=(e|0)==4;if(!((o|0)!=666|j)){break}h=d+16|0;if((c[h>>2]|0)==0){c[d+24>>2]=c[9];x=-5;return x|0}c[i>>2]=d;k=i+40|0;m=c[k>>2]|0;c[k>>2]=e;do{if((o|0)==42){if((c[i+24>>2]|0)!=2){n=(c[i+48>>2]<<12)-30720|0;do{if((c[i+136>>2]|0)>1){o=0}else{o=c[i+132>>2]|0;if((o|0)<2){o=0;break}if((o|0)<6){o=64;break}o=(o|0)==6?128:192}}while(0);o=o|n;n=i+108|0;x=(c[n>>2]|0)==0?o:o|32;c[l>>2]=113;p=i+20|0;o=c[p>>2]|0;c[p>>2]=o+1;q=i+8|0;a[(c[q>>2]|0)+o|0]=x>>>8;o=c[p>>2]|0;c[p>>2]=o+1;a[(c[q>>2]|0)+o|0]=(x|((x>>>0)%31|0))^31;o=d+48|0;if((c[n>>2]|0)!=0){x=c[o>>2]|0;w=c[p>>2]|0;c[p>>2]=w+1;a[(c[q>>2]|0)+w|0]=x>>>24;w=c[p>>2]|0;c[p>>2]=w+1;a[(c[q>>2]|0)+w|0]=x>>>16;w=c[o>>2]|0;x=c[p>>2]|0;c[p>>2]=x+1;a[(c[q>>2]|0)+x|0]=w>>>8;x=c[p>>2]|0;c[p>>2]=x+1;a[(c[q>>2]|0)+x|0]=w}c[o>>2]=Rf(0,0,0)|0;o=c[l>>2]|0;n=32;break}r=d+48|0;c[r>>2]=vf(0,0,0)|0;p=i+20|0;o=c[p>>2]|0;c[p>>2]=o+1;q=i+8|0;a[(c[q>>2]|0)+o|0]=31;o=c[p>>2]|0;c[p>>2]=o+1;a[(c[q>>2]|0)+o|0]=-117;o=c[p>>2]|0;c[p>>2]=o+1;a[(c[q>>2]|0)+o|0]=8;o=i+28|0;s=c[o>>2]|0;if((s|0)==0){o=c[p>>2]|0;c[p>>2]=o+1;a[(c[q>>2]|0)+o|0]=0;o=c[p>>2]|0;c[p>>2]=o+1;a[(c[q>>2]|0)+o|0]=0;o=c[p>>2]|0;c[p>>2]=o+1;a[(c[q>>2]|0)+o|0]=0;o=c[p>>2]|0;c[p>>2]=o+1;a[(c[q>>2]|0)+o|0]=0;o=c[p>>2]|0;c[p>>2]=o+1;a[(c[q>>2]|0)+o|0]=0;o=c[i+132>>2]|0;do{if((o|0)==9){o=2}else{if((c[i+136>>2]|0)>1){o=4;break}o=(o|0)<2?4:0}}while(0);x=c[p>>2]|0;c[p>>2]=x+1;a[(c[q>>2]|0)+x|0]=o;x=c[p>>2]|0;c[p>>2]=x+1;a[(c[q>>2]|0)+x|0]=3;c[l>>2]=113;break}x=((c[s+44>>2]|0)!=0?2:0)|(c[s>>2]|0)!=0|((c[s+16>>2]|0)==0?0:4)|((c[s+28>>2]|0)==0?0:8)|((c[s+36>>2]|0)==0?0:16);n=c[p>>2]|0;c[p>>2]=n+1;a[(c[q>>2]|0)+n|0]=x;n=c[(c[o>>2]|0)+4>>2]&255;x=c[p>>2]|0;c[p>>2]=x+1;a[(c[q>>2]|0)+x|0]=n;x=(c[(c[o>>2]|0)+4>>2]|0)>>>8&255;n=c[p>>2]|0;c[p>>2]=n+1;a[(c[q>>2]|0)+n|0]=x;n=(c[(c[o>>2]|0)+4>>2]|0)>>>16&255;x=c[p>>2]|0;c[p>>2]=x+1;a[(c[q>>2]|0)+x|0]=n;x=(c[(c[o>>2]|0)+4>>2]|0)>>>24&255;n=c[p>>2]|0;c[p>>2]=n+1;a[(c[q>>2]|0)+n|0]=x;n=c[i+132>>2]|0;do{if((n|0)==9){n=2}else{if((c[i+136>>2]|0)>1){n=4;break}n=(n|0)<2?4:0}}while(0);x=c[p>>2]|0;c[p>>2]=x+1;a[(c[q>>2]|0)+x|0]=n;x=c[(c[o>>2]|0)+12>>2]&255;n=c[p>>2]|0;c[p>>2]=n+1;a[(c[q>>2]|0)+n|0]=x;n=c[o>>2]|0;if((c[n+16>>2]|0)!=0){n=c[n+20>>2]&255;x=c[p>>2]|0;c[p>>2]=x+1;a[(c[q>>2]|0)+x|0]=n;x=(c[(c[o>>2]|0)+20>>2]|0)>>>8&255;n=c[p>>2]|0;c[p>>2]=n+1;a[(c[q>>2]|0)+n|0]=x;n=c[o>>2]|0}if((c[n+44>>2]|0)!=0){c[r>>2]=vf(c[r>>2]|0,c[q>>2]|0,c[p>>2]|0)|0}c[i+32>>2]=0;c[l>>2]=69;n=34}else{n=32}}while(0);do{if((n|0)==32){if((o|0)!=69){n=55;break}o=i+28|0;n=34}}while(0);do{if((n|0)==34){u=c[o>>2]|0;if((c[u+16>>2]|0)==0){c[l>>2]=73;n=57;break}p=i+20|0;w=c[p>>2]|0;n=i+32|0;x=c[n>>2]|0;a:do{if(x>>>0<(c[u+20>>2]&65535)>>>0){t=i+12|0;r=d+48|0;q=i+8|0;s=d+20|0;v=w;while(1){if((w|0)==(c[t>>2]|0)){if((c[u+44>>2]|0)!=0&w>>>0>v>>>0){c[r>>2]=vf(c[r>>2]|0,(c[q>>2]|0)+v|0,w-v|0)|0}u=c[f>>2]|0;w=c[u+20>>2]|0;v=c[h>>2]|0;v=w>>>0>v>>>0?v:w;do{if((v|0)!=0){Np(c[g>>2]|0,c[u+16>>2]|0,v)|0;c[g>>2]=(c[g>>2]|0)+v;u=(c[f>>2]|0)+16|0;c[u>>2]=(c[u>>2]|0)+v;c[s>>2]=(c[s>>2]|0)+v;c[h>>2]=(c[h>>2]|0)-v;u=(c[f>>2]|0)+20|0;c[u>>2]=(c[u>>2]|0)-v;u=c[f>>2]|0;if((c[u+20>>2]|0)!=0){break}c[u+16>>2]=c[u+8>>2]}}while(0);u=c[p>>2]|0;if((u|0)==(c[t>>2]|0)){break}v=u;w=u;x=c[n>>2]|0;u=c[o>>2]|0}x=a[(c[u+16>>2]|0)+x|0]|0;c[p>>2]=w+1;a[(c[q>>2]|0)+w|0]=x;x=(c[n>>2]|0)+1|0;c[n>>2]=x;u=c[o>>2]|0;if(x>>>0>=(c[u+20>>2]&65535)>>>0){break a}w=c[p>>2]|0}v=u;u=c[o>>2]|0}else{v=w}}while(0);do{if((c[u+44>>2]|0)!=0){p=c[p>>2]|0;if(p>>>0<=v>>>0){break}u=d+48|0;c[u>>2]=vf(c[u>>2]|0,(c[i+8>>2]|0)+v|0,p-v|0)|0;u=c[o>>2]|0}}while(0);if((c[n>>2]|0)==(c[u+20>>2]|0)){c[n>>2]=0;c[l>>2]=73;n=57;break}else{o=c[l>>2]|0;n=55;break}}}while(0);do{if((n|0)==55){if((o|0)!=73){n=76;break}u=c[i+28>>2]|0;n=57}}while(0);do{if((n|0)==57){o=i+28|0;if((c[u+28>>2]|0)==0){c[l>>2]=91;n=78;break}s=i+20|0;w=c[s>>2]|0;u=i+12|0;p=d+48|0;q=i+8|0;t=d+20|0;r=i+32|0;v=w;while(1){if((w|0)==(c[u>>2]|0)){if((c[(c[o>>2]|0)+44>>2]|0)!=0&w>>>0>v>>>0){c[p>>2]=vf(c[p>>2]|0,(c[q>>2]|0)+v|0,w-v|0)|0}v=c[f>>2]|0;x=c[v+20>>2]|0;w=c[h>>2]|0;w=x>>>0>w>>>0?w:x;do{if((w|0)!=0){Np(c[g>>2]|0,c[v+16>>2]|0,w)|0;c[g>>2]=(c[g>>2]|0)+w;v=(c[f>>2]|0)+16|0;c[v>>2]=(c[v>>2]|0)+w;c[t>>2]=(c[t>>2]|0)+w;c[h>>2]=(c[h>>2]|0)-w;v=(c[f>>2]|0)+20|0;c[v>>2]=(c[v>>2]|0)-w;v=c[f>>2]|0;if((c[v+20>>2]|0)!=0){break}c[v+16>>2]=c[v+8>>2]}}while(0);w=c[s>>2]|0;if((w|0)==(c[u>>2]|0)){t=1;v=w;break}else{v=w}}x=c[r>>2]|0;c[r>>2]=x+1;x=a[(c[(c[o>>2]|0)+28>>2]|0)+x|0]|0;c[s>>2]=w+1;a[(c[q>>2]|0)+w|0]=x;if(x<<24>>24==0){n=68;break}w=c[s>>2]|0}if((n|0)==68){t=x&255}do{if((c[(c[o>>2]|0)+44>>2]|0)!=0){n=c[s>>2]|0;if(n>>>0<=v>>>0){break}c[p>>2]=vf(c[p>>2]|0,(c[q>>2]|0)+v|0,n-v|0)|0}}while(0);if((t|0)==0){c[r>>2]=0;c[l>>2]=91;n=78;break}else{o=c[l>>2]|0;n=76;break}}}while(0);do{if((n|0)==76){if((o|0)!=91){n=97;break}o=i+28|0;n=78}}while(0);do{if((n|0)==78){if((c[(c[o>>2]|0)+36>>2]|0)==0){c[l>>2]=103;n=99;break}r=i+20|0;w=c[r>>2]|0;s=i+12|0;p=d+48|0;q=i+8|0;u=d+20|0;t=i+32|0;v=w;while(1){if((w|0)==(c[s>>2]|0)){if((c[(c[o>>2]|0)+44>>2]|0)!=0&w>>>0>v>>>0){c[p>>2]=vf(c[p>>2]|0,(c[q>>2]|0)+v|0,w-v|0)|0}v=c[f>>2]|0;w=c[v+20>>2]|0;x=c[h>>2]|0;w=w>>>0>x>>>0?x:w;do{if((w|0)!=0){Np(c[g>>2]|0,c[v+16>>2]|0,w)|0;c[g>>2]=(c[g>>2]|0)+w;v=(c[f>>2]|0)+16|0;c[v>>2]=(c[v>>2]|0)+w;c[u>>2]=(c[u>>2]|0)+w;c[h>>2]=(c[h>>2]|0)-w;v=(c[f>>2]|0)+20|0;c[v>>2]=(c[v>>2]|0)-w;v=c[f>>2]|0;if((c[v+20>>2]|0)!=0){break}c[v+16>>2]=c[v+8>>2]}}while(0);w=c[r>>2]|0;if((w|0)==(c[s>>2]|0)){s=1;v=w;break}else{v=w}}x=c[t>>2]|0;c[t>>2]=x+1;x=a[(c[(c[o>>2]|0)+36>>2]|0)+x|0]|0;c[r>>2]=w+1;a[(c[q>>2]|0)+w|0]=x;if(x<<24>>24==0){n=89;break}w=c[r>>2]|0}if((n|0)==89){s=x&255}do{if((c[(c[o>>2]|0)+44>>2]|0)!=0){n=c[r>>2]|0;if(n>>>0<=v>>>0){break}c[p>>2]=vf(c[p>>2]|0,(c[q>>2]|0)+v|0,n-v|0)|0}}while(0);if((s|0)==0){c[l>>2]=103;n=99;break}else{o=c[l>>2]|0;n=97;break}}}while(0);do{if((n|0)==97){if((o|0)!=103){break}o=i+28|0;n=99}}while(0);do{if((n|0)==99){if((c[(c[o>>2]|0)+44>>2]|0)==0){c[l>>2]=113;break}o=i+20|0;n=i+12|0;do{if(((c[o>>2]|0)+2|0)>>>0>(c[n>>2]|0)>>>0){p=c[f>>2]|0;r=c[p+20>>2]|0;q=c[h>>2]|0;q=r>>>0>q>>>0?q:r;if((q|0)==0){break}Np(c[g>>2]|0,c[p+16>>2]|0,q)|0;c[g>>2]=(c[g>>2]|0)+q;p=(c[f>>2]|0)+16|0;c[p>>2]=(c[p>>2]|0)+q;p=d+20|0;c[p>>2]=(c[p>>2]|0)+q;c[h>>2]=(c[h>>2]|0)-q;p=(c[f>>2]|0)+20|0;c[p>>2]=(c[p>>2]|0)-q;p=c[f>>2]|0;if((c[p+20>>2]|0)!=0){break}c[p+16>>2]=c[p+8>>2]}}while(0);p=c[o>>2]|0;if((p+2|0)>>>0>(c[n>>2]|0)>>>0){break}x=d+48|0;u=c[x>>2]&255;c[o>>2]=p+1;v=i+8|0;a[(c[v>>2]|0)+p|0]=u;u=(c[x>>2]|0)>>>8&255;w=c[o>>2]|0;c[o>>2]=w+1;a[(c[v>>2]|0)+w|0]=u;c[x>>2]=vf(0,0,0)|0;c[l>>2]=113}}while(0);o=i+20|0;do{if((c[o>>2]|0)==0){if((c[d+4>>2]|0)!=0){break}if(!((m|0)>=(e|0)&(e|0)!=4)){break}c[d+24>>2]=c[9];x=-5;return x|0}else{m=c[f>>2]|0;p=c[m+20>>2]|0;n=c[h>>2]|0;p=p>>>0>n>>>0?n:p;if((p|0)!=0){Np(c[g>>2]|0,c[m+16>>2]|0,p)|0;c[g>>2]=(c[g>>2]|0)+p;m=(c[f>>2]|0)+16|0;c[m>>2]=(c[m>>2]|0)+p;m=d+20|0;c[m>>2]=(c[m>>2]|0)+p;c[h>>2]=(c[h>>2]|0)-p;m=(c[f>>2]|0)+20|0;c[m>>2]=(c[m>>2]|0)-p;m=c[f>>2]|0;if((c[m+20>>2]|0)==0){c[m+16>>2]=c[m+8>>2]}n=c[h>>2]|0}if((n|0)!=0){break}c[k>>2]=-1;x=0;return x|0}}while(0);m=(c[l>>2]|0)==666;n=(c[d+4>>2]|0)==0;do{if(m){if(n){n=121;break}c[d+24>>2]=c[9];x=-5;return x|0}else{if(n){n=121}else{n=124}}}while(0);do{if((n|0)==121){if((c[i+116>>2]|0)!=0){n=124;break}if((e|0)==0){x=0;return x|0}else{if(m){break}else{n=124;break}}}}while(0);do{if((n|0)==124){m=Mc[c[11032+((c[i+132>>2]|0)*12|0)>>2]&63](i,e)|0;if((m&-2|0)==2){c[l>>2]=666}if((m&-3|0)==0){if((c[h>>2]|0)!=0){x=0;return x|0}c[k>>2]=-1;x=0;return x|0}if((m|0)!=1){break}do{if((e|0)==1){Jf(i)}else{If(i,0,0,0);if((e|0)!=3){break}x=i+76|0;w=i+68|0;b[(c[w>>2]|0)+((c[x>>2]|0)-1<<1)>>1]=0;Pp(c[w>>2]|0,0,(c[x>>2]<<1)-2|0)|0}}while(0);l=c[f>>2]|0;m=c[l+20>>2]|0;e=c[h>>2]|0;m=m>>>0>e>>>0?e:m;if((m|0)!=0){Np(c[g>>2]|0,c[l+16>>2]|0,m)|0;c[g>>2]=(c[g>>2]|0)+m;l=(c[f>>2]|0)+16|0;c[l>>2]=(c[l>>2]|0)+m;l=d+20|0;c[l>>2]=(c[l>>2]|0)+m;c[h>>2]=(c[h>>2]|0)-m;l=(c[f>>2]|0)+20|0;c[l>>2]=(c[l>>2]|0)-m;l=c[f>>2]|0;if((c[l+20>>2]|0)==0){c[l+16>>2]=c[l+8>>2]}e=c[h>>2]|0}if((e|0)!=0){break}c[k>>2]=-1;x=0;return x|0}}while(0);if(!j){x=0;return x|0}j=i+24|0;e=c[j>>2]|0;if((e|0)<1){x=1;return x|0}l=d+48|0;k=c[l>>2]|0;if((e|0)==2){u=c[o>>2]|0;c[o>>2]=u+1;w=i+8|0;a[(c[w>>2]|0)+u|0]=k;u=(c[l>>2]|0)>>>8&255;v=c[o>>2]|0;c[o>>2]=v+1;a[(c[w>>2]|0)+v|0]=u;v=(c[l>>2]|0)>>>16&255;u=c[o>>2]|0;c[o>>2]=u+1;a[(c[w>>2]|0)+u|0]=v;u=(c[l>>2]|0)>>>24&255;v=c[o>>2]|0;c[o>>2]=v+1;a[(c[w>>2]|0)+v|0]=u;v=d+8|0;u=c[v>>2]&255;x=c[o>>2]|0;c[o>>2]=x+1;a[(c[w>>2]|0)+x|0]=u;x=(c[v>>2]|0)>>>8&255;u=c[o>>2]|0;c[o>>2]=u+1;a[(c[w>>2]|0)+u|0]=x;u=(c[v>>2]|0)>>>16&255;x=c[o>>2]|0;c[o>>2]=x+1;a[(c[w>>2]|0)+x|0]=u;v=(c[v>>2]|0)>>>24&255;x=c[o>>2]|0;c[o>>2]=x+1;a[(c[w>>2]|0)+x|0]=v}else{v=c[o>>2]|0;c[o>>2]=v+1;w=i+8|0;a[(c[w>>2]|0)+v|0]=k>>>24;v=c[o>>2]|0;c[o>>2]=v+1;a[(c[w>>2]|0)+v|0]=k>>>16;v=c[l>>2]|0;x=c[o>>2]|0;c[o>>2]=x+1;a[(c[w>>2]|0)+x|0]=v>>>8;x=c[o>>2]|0;c[o>>2]=x+1;a[(c[w>>2]|0)+x|0]=v}i=c[f>>2]|0;l=c[i+20>>2]|0;k=c[h>>2]|0;k=l>>>0>k>>>0?k:l;do{if((k|0)!=0){Np(c[g>>2]|0,c[i+16>>2]|0,k)|0;c[g>>2]=(c[g>>2]|0)+k;x=(c[f>>2]|0)+16|0;c[x>>2]=(c[x>>2]|0)+k;d=d+20|0;c[d>>2]=(c[d>>2]|0)+k;c[h>>2]=(c[h>>2]|0)-k;d=(c[f>>2]|0)+20|0;c[d>>2]=(c[d>>2]|0)-k;d=c[f>>2]|0;if((c[d+20>>2]|0)!=0){break}c[d+16>>2]=c[d+8>>2]}}while(0);d=c[j>>2]|0;if((d|0)>0){c[j>>2]=-d}x=(c[o>>2]|0)==0|0;return x|0}}while(0);c[d+24>>2]=c[6];x=-2;return x|0}function Af(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;d=(c[a+12>>2]|0)-5|0;j=d>>>0<65535>>>0?d:65535;i=a+116|0;e=a+108|0;f=a+92|0;h=a+44|0;g=a+56|0;d=a|0;while(1){k=c[i>>2]|0;if(k>>>0<2>>>0){Df(a);k=c[i>>2]|0;if((k|b|0)==0){d=0;h=28;break}if((k|0)==0){h=20;break}}l=(c[e>>2]|0)+k|0;c[e>>2]=l;c[i>>2]=0;k=c[f>>2]|0;m=k+j|0;if(!((l|0)!=0&l>>>0<m>>>0)){c[i>>2]=l-m;c[e>>2]=m;if((k|0)>-1){k=(c[g>>2]|0)+k|0}else{k=0}Kf(a,k,j,0);c[f>>2]=c[e>>2];k=c[d>>2]|0;m=k+28|0;n=c[m>>2]|0;o=c[n+20>>2]|0;l=k+16|0;p=c[l>>2]|0;o=o>>>0>p>>>0?p:o;do{if((o|0)!=0){p=k+12|0;Np(c[p>>2]|0,c[n+16>>2]|0,o)|0;c[p>>2]=(c[p>>2]|0)+o;p=(c[m>>2]|0)+16|0;c[p>>2]=(c[p>>2]|0)+o;k=k+20|0;c[k>>2]=(c[k>>2]|0)+o;c[l>>2]=(c[l>>2]|0)-o;k=(c[m>>2]|0)+20|0;c[k>>2]=(c[k>>2]|0)-o;k=c[m>>2]|0;if((c[k+20>>2]|0)!=0){break}c[k+16>>2]=c[k+8>>2]}}while(0);if((c[(c[d>>2]|0)+16>>2]|0)==0){d=0;h=28;break}l=c[e>>2]|0;k=c[f>>2]|0}l=l-k|0;if(l>>>0<((c[h>>2]|0)-262|0)>>>0){continue}if((k|0)>-1){k=(c[g>>2]|0)+k|0}else{k=0}Kf(a,k,l,0);c[f>>2]=c[e>>2];m=c[d>>2]|0;k=m+28|0;l=c[k>>2]|0;o=c[l+20>>2]|0;n=m+16|0;p=c[n>>2]|0;o=o>>>0>p>>>0?p:o;do{if((o|0)!=0){p=m+12|0;Np(c[p>>2]|0,c[l+16>>2]|0,o)|0;c[p>>2]=(c[p>>2]|0)+o;p=(c[k>>2]|0)+16|0;c[p>>2]=(c[p>>2]|0)+o;p=m+20|0;c[p>>2]=(c[p>>2]|0)+o;c[n>>2]=(c[n>>2]|0)-o;p=(c[k>>2]|0)+20|0;c[p>>2]=(c[p>>2]|0)-o;k=c[k>>2]|0;if((c[k+20>>2]|0)!=0){break}c[k+16>>2]=c[k+8>>2]}}while(0);if((c[(c[d>>2]|0)+16>>2]|0)==0){d=0;h=28;break}}if((h|0)==20){h=c[f>>2]|0;if((h|0)>-1){g=(c[g>>2]|0)+h|0}else{g=0}b=(b|0)==4;Kf(a,g,(c[e>>2]|0)-h|0,b&1);c[f>>2]=c[e>>2];e=c[d>>2]|0;g=e+28|0;f=c[g>>2]|0;h=c[f+20>>2]|0;a=e+16|0;i=c[a>>2]|0;h=h>>>0>i>>>0?i:h;do{if((h|0)!=0){p=e+12|0;Np(c[p>>2]|0,c[f+16>>2]|0,h)|0;c[p>>2]=(c[p>>2]|0)+h;p=(c[g>>2]|0)+16|0;c[p>>2]=(c[p>>2]|0)+h;p=e+20|0;c[p>>2]=(c[p>>2]|0)+h;c[a>>2]=(c[a>>2]|0)-h;a=(c[g>>2]|0)+20|0;c[a>>2]=(c[a>>2]|0)-h;a=c[g>>2]|0;if((c[a+20>>2]|0)!=0){break}c[a+16>>2]=c[a+8>>2]}}while(0);if((c[(c[d>>2]|0)+16>>2]|0)==0){p=b?2:0;return p|0}else{p=b?3:1;return p|0}}else if((h|0)==28){return d|0}return 0}function Bf(e,f){e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;r=e+116|0;y=(f|0)==0;A=e+72|0;B=e+88|0;i=e+108|0;j=e+56|0;l=e+84|0;m=e+68|0;o=e+52|0;n=e+64|0;z=e+96|0;t=e+112|0;p=e+5792|0;u=e+5796|0;v=e+5784|0;q=e+5788|0;s=e+128|0;h=e+92|0;g=e|0;x=e+44|0;w=e+136|0;C=0;while(1){if((c[r>>2]|0)>>>0<262>>>0){Df(e);D=c[r>>2]|0;if(D>>>0<262>>>0&y){g=0;k=38;break}if((D|0)==0){k=30;break}if(D>>>0>2>>>0){k=6}}else{k=6}if((k|0)==6){k=0;I=c[i>>2]|0;C=((d[(c[j>>2]|0)+(I+2)|0]|0)^c[A>>2]<<c[B>>2])&c[l>>2];c[A>>2]=C;C=b[(c[m>>2]|0)+(C<<1)>>1]|0;b[(c[n>>2]|0)+((c[o>>2]&I)<<1)>>1]=C;b[(c[m>>2]|0)+(c[A>>2]<<1)>>1]=c[i>>2];C=C&65535}do{if((C|0)==0){k=13}else{D=(c[i>>2]|0)-C|0;if(D>>>0>((c[x>>2]|0)-262|0)>>>0){k=13;break}E=c[w>>2]|0;if((E-2|0)>>>0>=2>>>0){D=Ef(e,C)|0;c[z>>2]=D;break}if(!((E|0)==3&(D|0)==1)){k=13;break}D=Ff(e,C)|0;c[z>>2]=D}}while(0);if((k|0)==13){k=0;D=c[z>>2]|0}do{if(D>>>0>2>>>0){D=D+253|0;I=(c[i>>2]|0)-(c[t>>2]|0)&65535;b[(c[u>>2]|0)+(c[p>>2]<<1)>>1]=I;H=c[p>>2]|0;c[p>>2]=H+1;a[(c[v>>2]|0)+H|0]=D;I=I-1&65535;D=e+148+((d[18456+(D&255)|0]|0|256)+1<<2)|0;b[D>>1]=(b[D>>1]|0)+1;D=I&65535;if((I&65535)>>>0>=256>>>0){D=(D>>>7)+256|0}D=e+2440+((d[18712+D|0]|0)<<2)|0;b[D>>1]=(b[D>>1]|0)+1;D=(c[p>>2]|0)==((c[q>>2]|0)-1|0)|0;E=c[z>>2]|0;I=(c[r>>2]|0)-E|0;c[r>>2]=I;if(!(E>>>0<=(c[s>>2]|0)>>>0&I>>>0>2>>>0)){E=(c[i>>2]|0)+E|0;c[i>>2]=E;c[z>>2]=0;H=c[j>>2]|0;I=d[H+E|0]|0;c[A>>2]=I;c[A>>2]=((d[H+(E+1)|0]|0)^I<<c[B>>2])&c[l>>2];break}c[z>>2]=E-1;do{C=c[i>>2]|0;I=C+1|0;c[i>>2]=I;C=((d[(c[j>>2]|0)+(C+3)|0]|0)^c[A>>2]<<c[B>>2])&c[l>>2];c[A>>2]=C;C=b[(c[m>>2]|0)+(C<<1)>>1]|0;b[(c[n>>2]|0)+((c[o>>2]&I)<<1)>>1]=C;b[(c[m>>2]|0)+(c[A>>2]<<1)>>1]=c[i>>2];I=(c[z>>2]|0)-1|0;c[z>>2]=I;}while((I|0)!=0);E=(c[i>>2]|0)+1|0;c[i>>2]=E;C=C&65535}else{D=a[(c[j>>2]|0)+(c[i>>2]|0)|0]|0;b[(c[u>>2]|0)+(c[p>>2]<<1)>>1]=0;E=c[p>>2]|0;c[p>>2]=E+1;a[(c[v>>2]|0)+E|0]=D;D=e+148+((D&255)<<2)|0;b[D>>1]=(b[D>>1]|0)+1;D=(c[p>>2]|0)==((c[q>>2]|0)-1|0)|0;c[r>>2]=(c[r>>2]|0)-1;E=(c[i>>2]|0)+1|0;c[i>>2]=E}}while(0);if((D|0)==0){continue}D=c[h>>2]|0;if((D|0)>-1){F=(c[j>>2]|0)+D|0}else{F=0}Kf(e,F,E-D|0,0);c[h>>2]=c[i>>2];G=c[g>>2]|0;E=G+28|0;F=c[E>>2]|0;H=c[F+20>>2]|0;D=G+16|0;I=c[D>>2]|0;H=H>>>0>I>>>0?I:H;do{if((H|0)!=0){I=G+12|0;Np(c[I>>2]|0,c[F+16>>2]|0,H)|0;c[I>>2]=(c[I>>2]|0)+H;I=(c[E>>2]|0)+16|0;c[I>>2]=(c[I>>2]|0)+H;I=G+20|0;c[I>>2]=(c[I>>2]|0)+H;c[D>>2]=(c[D>>2]|0)-H;D=(c[E>>2]|0)+20|0;c[D>>2]=(c[D>>2]|0)-H;D=c[E>>2]|0;if((c[D+20>>2]|0)!=0){break}c[D+16>>2]=c[D+8>>2]}}while(0);if((c[(c[g>>2]|0)+16>>2]|0)==0){g=0;k=38;break}}if((k|0)==30){k=c[h>>2]|0;if((k|0)>-1){j=(c[j>>2]|0)+k|0}else{j=0}f=(f|0)==4;Kf(e,j,(c[i>>2]|0)-k|0,f&1);c[h>>2]=c[i>>2];i=c[g>>2]|0;j=i+28|0;e=c[j>>2]|0;l=c[e+20>>2]|0;h=i+16|0;k=c[h>>2]|0;k=l>>>0>k>>>0?k:l;do{if((k|0)!=0){I=i+12|0;Np(c[I>>2]|0,c[e+16>>2]|0,k)|0;c[I>>2]=(c[I>>2]|0)+k;I=(c[j>>2]|0)+16|0;c[I>>2]=(c[I>>2]|0)+k;I=i+20|0;c[I>>2]=(c[I>>2]|0)+k;c[h>>2]=(c[h>>2]|0)-k;h=(c[j>>2]|0)+20|0;c[h>>2]=(c[h>>2]|0)-k;h=c[j>>2]|0;if((c[h+20>>2]|0)!=0){break}c[h+16>>2]=c[h+8>>2]}}while(0);if((c[(c[g>>2]|0)+16>>2]|0)==0){I=f?2:0;return I|0}else{I=f?3:1;return I|0}}else if((k|0)==38){return g|0}return 0}function Cf(e,f){e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;t=e+116|0;A=(f|0)==0;l=e+72|0;m=e+88|0;h=e+108|0;j=e+56|0;n=e+84|0;o=e+68|0;q=e+52|0;p=e+64|0;w=e+96|0;r=e+120|0;v=e+112|0;u=e+100|0;C=e+5792|0;B=e+5796|0;D=e+5784|0;s=e+5788|0;E=e+104|0;i=e+92|0;g=e|0;z=e+128|0;y=e+44|0;x=e+136|0;F=0;a:while(1){G=c[t>>2]|0;while(1){if(G>>>0<262>>>0){Df(e);G=c[t>>2]|0;if(G>>>0<262>>>0&A){g=0;k=54;break a}if((G|0)==0){k=44;break a}if(G>>>0>2>>>0){k=7}}else{k=7}if((k|0)==7){k=0;L=c[h>>2]|0;F=((d[(c[j>>2]|0)+(L+2)|0]|0)^c[l>>2]<<c[m>>2])&c[n>>2];c[l>>2]=F;F=b[(c[o>>2]|0)+(F<<1)>>1]|0;b[(c[p>>2]|0)+((c[q>>2]&L)<<1)>>1]=F;b[(c[o>>2]|0)+(c[l>>2]<<1)>>1]=c[h>>2];F=F&65535}H=c[w>>2]|0;c[r>>2]=H;c[u>>2]=c[v>>2];c[w>>2]=2;do{if((F|0)==0){G=2;k=20}else{if(H>>>0>=(c[z>>2]|0)>>>0){G=2;break}G=(c[h>>2]|0)-F|0;if(G>>>0>((c[y>>2]|0)-262|0)>>>0){G=2;k=20;break}H=c[x>>2]|0;do{if((H-2|0)>>>0<2>>>0){if(!((H|0)==3&(G|0)==1)){G=2;break}H=Ff(e,F)|0;G=H;k=15}else{H=Ef(e,F)|0;G=H;k=15}}while(0);if((k|0)==15){c[w>>2]=H;if(G>>>0>=6>>>0){k=20;break}}if((c[x>>2]|0)!=1){if((G|0)!=3){k=20;break}if(((c[h>>2]|0)-(c[v>>2]|0)|0)>>>0<=4096>>>0){G=3;k=20;break}}c[w>>2]=2;G=2;k=20}}while(0);if((k|0)==20){k=0;H=c[r>>2]|0}if(!(H>>>0<3>>>0|G>>>0>H>>>0)){break}if((c[E>>2]|0)==0){c[E>>2]=1;c[h>>2]=(c[h>>2]|0)+1;G=(c[t>>2]|0)-1|0;c[t>>2]=G;continue}L=a[(c[j>>2]|0)+((c[h>>2]|0)-1)|0]|0;b[(c[B>>2]|0)+(c[C>>2]<<1)>>1]=0;K=c[C>>2]|0;c[C>>2]=K+1;a[(c[D>>2]|0)+K|0]=L;L=e+148+((L&255)<<2)|0;b[L>>1]=(b[L>>1]|0)+1;do{if((c[C>>2]|0)==((c[s>>2]|0)-1|0)){H=c[i>>2]|0;if((H|0)>-1){G=(c[j>>2]|0)+H|0}else{G=0}Kf(e,G,(c[h>>2]|0)-H|0,0);c[i>>2]=c[h>>2];G=c[g>>2]|0;H=G+28|0;J=c[H>>2]|0;K=c[J+20>>2]|0;I=G+16|0;L=c[I>>2]|0;K=K>>>0>L>>>0?L:K;if((K|0)==0){break}L=G+12|0;Np(c[L>>2]|0,c[J+16>>2]|0,K)|0;c[L>>2]=(c[L>>2]|0)+K;L=(c[H>>2]|0)+16|0;c[L>>2]=(c[L>>2]|0)+K;G=G+20|0;c[G>>2]=(c[G>>2]|0)+K;c[I>>2]=(c[I>>2]|0)-K;G=(c[H>>2]|0)+20|0;c[G>>2]=(c[G>>2]|0)-K;G=c[H>>2]|0;if((c[G+20>>2]|0)!=0){break}c[G+16>>2]=c[G+8>>2]}}while(0);c[h>>2]=(c[h>>2]|0)+1;G=(c[t>>2]|0)-1|0;c[t>>2]=G;if((c[(c[g>>2]|0)+16>>2]|0)==0){g=0;k=54;break a}}L=c[h>>2]|0;G=L-3+(c[t>>2]|0)|0;H=H+253|0;L=L+65535-(c[u>>2]|0)&65535;b[(c[B>>2]|0)+(c[C>>2]<<1)>>1]=L;K=c[C>>2]|0;c[C>>2]=K+1;a[(c[D>>2]|0)+K|0]=H;L=L-1&65535;H=e+148+((d[18456+(H&255)|0]|0|256)+1<<2)|0;b[H>>1]=(b[H>>1]|0)+1;H=L&65535;if((L&65535)>>>0>=256>>>0){H=(H>>>7)+256|0}H=e+2440+((d[18712+H|0]|0)<<2)|0;b[H>>1]=(b[H>>1]|0)+1;H=c[C>>2]|0;I=(c[s>>2]|0)-1|0;J=c[r>>2]|0;c[t>>2]=1-J+(c[t>>2]|0);J=J-2|0;c[r>>2]=J;do{K=c[h>>2]|0;L=K+1|0;c[h>>2]=L;if(L>>>0<=G>>>0){F=((d[(c[j>>2]|0)+(K+3)|0]|0)^c[l>>2]<<c[m>>2])&c[n>>2];c[l>>2]=F;F=b[(c[o>>2]|0)+(F<<1)>>1]|0;b[(c[p>>2]|0)+((c[q>>2]&L)<<1)>>1]=F;b[(c[o>>2]|0)+(c[l>>2]<<1)>>1]=c[h>>2];F=F&65535;J=c[r>>2]|0}J=J-1|0;c[r>>2]=J;}while((J|0)!=0);c[E>>2]=0;c[w>>2]=2;G=(c[h>>2]|0)+1|0;c[h>>2]=G;if((H|0)!=(I|0)){continue}H=c[i>>2]|0;if((H|0)>-1){I=(c[j>>2]|0)+H|0}else{I=0}Kf(e,I,G-H|0,0);c[i>>2]=c[h>>2];H=c[g>>2]|0;I=H+28|0;J=c[I>>2]|0;K=c[J+20>>2]|0;G=H+16|0;L=c[G>>2]|0;K=K>>>0>L>>>0?L:K;do{if((K|0)!=0){L=H+12|0;Np(c[L>>2]|0,c[J+16>>2]|0,K)|0;c[L>>2]=(c[L>>2]|0)+K;L=(c[I>>2]|0)+16|0;c[L>>2]=(c[L>>2]|0)+K;L=H+20|0;c[L>>2]=(c[L>>2]|0)+K;c[G>>2]=(c[G>>2]|0)-K;G=(c[I>>2]|0)+20|0;c[G>>2]=(c[G>>2]|0)-K;G=c[I>>2]|0;if((c[G+20>>2]|0)!=0){break}c[G+16>>2]=c[G+8>>2]}}while(0);if((c[(c[g>>2]|0)+16>>2]|0)==0){g=0;k=54;break}}if((k|0)==44){if((c[E>>2]|0)!=0){L=a[(c[j>>2]|0)+((c[h>>2]|0)-1)|0]|0;b[(c[B>>2]|0)+(c[C>>2]<<1)>>1]=0;K=c[C>>2]|0;c[C>>2]=K+1;a[(c[D>>2]|0)+K|0]=L;L=e+148+((L&255)<<2)|0;b[L>>1]=(b[L>>1]|0)+1;c[E>>2]=0}k=c[i>>2]|0;if((k|0)>-1){j=(c[j>>2]|0)+k|0}else{j=0}f=(f|0)==4;Kf(e,j,(c[h>>2]|0)-k|0,f&1);c[i>>2]=c[h>>2];h=c[g>>2]|0;i=h+28|0;e=c[i>>2]|0;k=c[e+20>>2]|0;j=h+16|0;l=c[j>>2]|0;k=k>>>0>l>>>0?l:k;do{if((k|0)!=0){L=h+12|0;Np(c[L>>2]|0,c[e+16>>2]|0,k)|0;c[L>>2]=(c[L>>2]|0)+k;L=(c[i>>2]|0)+16|0;c[L>>2]=(c[L>>2]|0)+k;h=h+20|0;c[h>>2]=(c[h>>2]|0)+k;c[j>>2]=(c[j>>2]|0)-k;h=(c[i>>2]|0)+20|0;c[h>>2]=(c[h>>2]|0)-k;h=c[i>>2]|0;if((c[h+20>>2]|0)!=0){break}c[h+16>>2]=c[h+8>>2]}}while(0);if((c[(c[g>>2]|0)+16>>2]|0)==0){L=f?2:0;return L|0}else{L=f?3:1;return L|0}}else if((k|0)==54){return g|0}return 0}function Df(a){a=a|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;r=a+44|0;k=c[r>>2]|0;p=a+60|0;j=a+116|0;t=a+108|0;q=k-262|0;g=a|0;s=a+56|0;n=a+72|0;h=a+88|0;i=a+84|0;l=a+112|0;m=a+92|0;f=a+76|0;o=a+68|0;a=a+64|0;u=c[j>>2]|0;v=k;while(1){z=c[t>>2]|0;u=(c[p>>2]|0)-u-z|0;if(z>>>0>=(q+v|0)>>>0){v=c[s>>2]|0;Np(v|0,v+k|0,k)|0;c[l>>2]=(c[l>>2]|0)-k;c[t>>2]=(c[t>>2]|0)-k;c[m>>2]=(c[m>>2]|0)-k;v=c[f>>2]|0;w=v;v=(c[o>>2]|0)+(v<<1)|0;do{v=v-2|0;x=e[v>>1]|0;if(x>>>0<k>>>0){x=0}else{x=x-k&65535}b[v>>1]=x;w=w-1|0;}while((w|0)!=0);v=k;w=(c[a>>2]|0)+(k<<1)|0;do{w=w-2|0;x=e[w>>1]|0;if(x>>>0<k>>>0){x=0}else{x=x-k&65535}b[w>>1]=x;v=v-1|0;}while((v|0)!=0);u=u+k|0}w=c[g>>2]|0;y=w+4|0;z=c[y>>2]|0;if((z|0)==0){f=23;break}x=c[j>>2]|0;v=(c[s>>2]|0)+(x+(c[t>>2]|0))|0;u=z>>>0>u>>>0?u:z;if((u|0)==0){u=0}else{c[y>>2]=z-u;x=c[(c[w+28>>2]|0)+24>>2]|0;if((x|0)==2){z=w+48|0;x=w|0;c[z>>2]=vf(c[z>>2]|0,c[x>>2]|0,u)|0}else if((x|0)==1){z=w+48|0;x=w|0;c[z>>2]=Rf(c[z>>2]|0,c[x>>2]|0,u)|0}else{x=w|0}Np(v|0,c[x>>2]|0,u)|0;c[x>>2]=(c[x>>2]|0)+u;x=w+8|0;c[x>>2]=(c[x>>2]|0)+u;x=c[j>>2]|0}u=x+u|0;c[j>>2]=u;if(u>>>0>2>>>0){y=c[t>>2]|0;x=c[s>>2]|0;z=d[x+y|0]|0;c[n>>2]=z;c[n>>2]=((d[x+(y+1)|0]|0)^z<<c[h>>2])&c[i>>2];if(u>>>0>=262>>>0){f=23;break}}if((c[(c[g>>2]|0)+4>>2]|0)==0){f=23;break}v=c[r>>2]|0}if((f|0)==23){return}}function Ef(b,d){b=b|0;d=d|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;v=c[b+124>>2]|0;i=c[b+56>>2]|0;g=c[b+108>>2]|0;h=i+g|0;w=c[b+120>>2]|0;n=c[b+144>>2]|0;f=(c[b+44>>2]|0)-262|0;m=g>>>0>f>>>0?g-f|0:0;k=c[b+64>>2]|0;l=c[b+52>>2]|0;j=i+(g+258)|0;f=c[b+116>>2]|0;r=n>>>0>f>>>0?f:n;n=b+112|0;o=i+(g+1)|0;q=i+(g+2)|0;s=j;p=g+257|0;t=a[i+(w+g)|0]|0;u=a[i+(g-1+w)|0]|0;v=w>>>0<(c[b+140>>2]|0)>>>0?v:v>>>2;a:while(1){b=i+d|0;do{if((a[i+(d+w)|0]|0)==t<<24>>24){if((a[i+(w-1+d)|0]|0)!=u<<24>>24){break}if((a[b]|0)!=(a[h]|0)){break}if((a[i+(d+1)|0]|0)!=(a[o]|0)){break}b=q;x=i+(d+2)|0;do{y=b+1|0;if((a[y]|0)!=(a[x+1|0]|0)){b=y;break}y=b+2|0;if((a[y]|0)!=(a[x+2|0]|0)){b=y;break}y=b+3|0;if((a[y]|0)!=(a[x+3|0]|0)){b=y;break}y=b+4|0;if((a[y]|0)!=(a[x+4|0]|0)){b=y;break}y=b+5|0;if((a[y]|0)!=(a[x+5|0]|0)){b=y;break}y=b+6|0;if((a[y]|0)!=(a[x+6|0]|0)){b=y;break}y=b+7|0;if((a[y]|0)!=(a[x+7|0]|0)){b=y;break}b=b+8|0;x=x+8|0;}while((a[b]|0)==(a[x]|0)&b>>>0<j>>>0);x=b-s|0;b=x+258|0;if((b|0)<=(w|0)){break}c[n>>2]=d;if((b|0)>=(r|0)){w=b;g=20;break a}t=a[i+(b+g)|0]|0;u=a[i+(p+x)|0]|0;w=b}}while(0);d=e[k+((d&l)<<1)>>1]|0;if(d>>>0<=m>>>0){g=20;break}v=v-1|0;if((v|0)==0){g=20;break}}if((g|0)==20){return(w>>>0>f>>>0?f:w)|0}return 0}function Ff(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;g=c[b+56>>2]|0;f=c[b+108>>2]|0;e=g+(f+258)|0;if((a[g+d|0]|0)!=(a[g+f|0]|0)){h=2;return h|0}if((a[g+(d+1)|0]|0)!=(a[g+(f+1)|0]|0)){h=2;return h|0}f=g+(f+2)|0;g=g+(d+2)|0;do{h=f+1|0;if((a[h]|0)!=(a[g+1|0]|0)){f=h;break}h=f+2|0;if((a[h]|0)!=(a[g+2|0]|0)){f=h;break}h=f+3|0;if((a[h]|0)!=(a[g+3|0]|0)){f=h;break}h=f+4|0;if((a[h]|0)!=(a[g+4|0]|0)){f=h;break}h=f+5|0;if((a[h]|0)!=(a[g+5|0]|0)){f=h;break}h=f+6|0;if((a[h]|0)!=(a[g+6|0]|0)){f=h;break}h=f+7|0;if((a[h]|0)!=(a[g+7|0]|0)){f=h;break}f=f+8|0;g=g+8|0;}while((a[f]|0)==(a[g]|0)&f>>>0<e>>>0);e=f-e+258|0;if((e|0)<3){h=2;return h|0}c[b+112>>2]=d;d=c[b+116>>2]|0;h=e>>>0>d>>>0?d:e;return h|0}function Gf(a){a=a|0;c[a+2840>>2]=a+148;c[a+2848>>2]=1456;c[a+2852>>2]=a+2440;c[a+2860>>2]=1600;c[a+2864>>2]=a+2684;c[a+2872>>2]=1624;b[a+5816>>1]=0;c[a+5820>>2]=0;c[a+5812>>2]=8;Hf(a);return}function Hf(a){a=a|0;var d=0;d=0;do{b[a+148+(d<<2)>>1]=0;d=d+1|0;}while((d|0)<286);b[a+2440>>1]=0;b[a+2444>>1]=0;b[a+2448>>1]=0;b[a+2452>>1]=0;b[a+2456>>1]=0;b[a+2460>>1]=0;b[a+2464>>1]=0;b[a+2468>>1]=0;b[a+2472>>1]=0;b[a+2476>>1]=0;b[a+2480>>1]=0;b[a+2484>>1]=0;b[a+2488>>1]=0;b[a+2492>>1]=0;b[a+2496>>1]=0;b[a+2500>>1]=0;b[a+2504>>1]=0;b[a+2508>>1]=0;b[a+2512>>1]=0;b[a+2516>>1]=0;b[a+2520>>1]=0;b[a+2524>>1]=0;b[a+2528>>1]=0;b[a+2532>>1]=0;b[a+2536>>1]=0;b[a+2540>>1]=0;b[a+2544>>1]=0;b[a+2548>>1]=0;b[a+2552>>1]=0;b[a+2556>>1]=0;b[a+2684>>1]=0;b[a+2688>>1]=0;b[a+2692>>1]=0;b[a+2696>>1]=0;b[a+2700>>1]=0;b[a+2704>>1]=0;b[a+2708>>1]=0;b[a+2712>>1]=0;b[a+2716>>1]=0;b[a+2720>>1]=0;b[a+2724>>1]=0;b[a+2728>>1]=0;b[a+2732>>1]=0;b[a+2736>>1]=0;b[a+2740>>1]=0;b[a+2744>>1]=0;b[a+2748>>1]=0;b[a+2752>>1]=0;b[a+2756>>1]=0;b[a+1172>>1]=1;c[a+5804>>2]=0;c[a+5800>>2]=0;c[a+5808>>2]=0;c[a+5792>>2]=0;return}function If(d,f,g,h){d=d|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0;i=d+5820|0;l=c[i>>2]|0;j=d+5816|0;k=e[j>>1]|0|h<<l;b[j>>1]=k;if((l|0)>13){n=d+20|0;l=c[n>>2]|0;c[n>>2]=l+1;m=d+8|0;a[(c[m>>2]|0)+l|0]=k;k=(e[j>>1]|0)>>>8&255;l=c[n>>2]|0;c[n>>2]=l+1;a[(c[m>>2]|0)+l|0]=k;l=c[i>>2]|0;h=(h&65535)>>>((16-l|0)>>>0);b[j>>1]=h;l=l-13|0;h=h&255}else{l=l+3|0;h=k&255}c[i>>2]=l;do{if((l|0)>8){k=d+20|0;m=c[k>>2]|0;c[k>>2]=m+1;l=d+8|0;a[(c[l>>2]|0)+m|0]=h;m=(e[j>>1]|0)>>>8&255;n=c[k>>2]|0;c[k>>2]=n+1;a[(c[l>>2]|0)+n|0]=m}else{k=d+20|0;if((l|0)>0){n=c[k>>2]|0;c[k>>2]=n+1;l=d+8|0;a[(c[l>>2]|0)+n|0]=h;break}else{l=d+8|0;break}}}while(0);b[j>>1]=0;c[i>>2]=0;c[d+5812>>2]=8;m=c[k>>2]|0;c[k>>2]=m+1;a[(c[l>>2]|0)+m|0]=g;m=c[k>>2]|0;c[k>>2]=m+1;a[(c[l>>2]|0)+m|0]=g>>>8;m=g&65535^65535;n=c[k>>2]|0;c[k>>2]=n+1;a[(c[l>>2]|0)+n|0]=m;n=c[k>>2]|0;c[k>>2]=n+1;a[(c[l>>2]|0)+n|0]=m>>>8;if((g|0)==0){return}while(1){g=g-1|0;m=a[f]|0;n=c[k>>2]|0;c[k>>2]=n+1;a[(c[l>>2]|0)+n|0]=m;if((g|0)==0){break}else{f=f+1|0}}return}function Jf(d){d=d|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=d+5820|0;i=c[f>>2]|0;g=d+5816|0;j=e[g>>1]|0|2<<i;h=j&65535;b[g>>1]=h;if((i|0)>13){l=d+20|0;k=c[l>>2]|0;c[l>>2]=k+1;h=d+8|0;a[(c[h>>2]|0)+k|0]=j;k=(e[g>>1]|0)>>>8&255;i=c[l>>2]|0;c[l>>2]=i+1;a[(c[h>>2]|0)+i|0]=k;i=c[f>>2]|0;h=2>>>((16-i|0)>>>0)&65535;b[g>>1]=h;i=i-13|0}else{i=i+3|0}c[f>>2]=i;if((i|0)>9){k=d+20|0;i=c[k>>2]|0;c[k>>2]=i+1;l=d+8|0;a[(c[l>>2]|0)+i|0]=h;h=(e[g>>1]|0)>>>8&255;i=c[k>>2]|0;c[k>>2]=i+1;a[(c[l>>2]|0)+i|0]=h;b[g>>1]=0;i=(c[f>>2]|0)-9|0;h=0}else{i=i+7|0}c[f>>2]=i;do{if((i|0)==16){k=d+20|0;l=c[k>>2]|0;c[k>>2]=l+1;j=d+8|0;a[(c[j>>2]|0)+l|0]=h;l=(e[g>>1]|0)>>>8&255;i=c[k>>2]|0;c[k>>2]=i+1;a[(c[j>>2]|0)+i|0]=l;b[g>>1]=0;c[f>>2]=0;i=0;j=0}else{if((i|0)<=7){j=h;break}i=d+20|0;j=c[i>>2]|0;c[i>>2]=j+1;a[(c[d+8>>2]|0)+j|0]=h;j=(e[g>>1]|0)>>>8;b[g>>1]=j;i=(c[f>>2]|0)-8|0;c[f>>2]=i}}while(0);h=d+5812|0;if((11-i+(c[h>>2]|0)|0)>=9){c[h>>2]=7;return}j=j&65535|2<<i;b[g>>1]=j;if((i|0)>13){m=d+20|0;l=c[m>>2]|0;c[m>>2]=l+1;i=d+8|0;a[(c[i>>2]|0)+l|0]=j;l=(e[g>>1]|0)>>>8&255;k=c[m>>2]|0;c[m>>2]=k+1;a[(c[i>>2]|0)+k|0]=l;k=c[f>>2]|0;i=2>>>((16-k|0)>>>0);b[g>>1]=i;k=k-13|0;i=i&255}else{k=i+3|0;i=j&255}c[f>>2]=k;if((k|0)>9){l=d+20|0;j=c[l>>2]|0;c[l>>2]=j+1;m=d+8|0;a[(c[m>>2]|0)+j|0]=i;i=(e[g>>1]|0)>>>8&255;j=c[l>>2]|0;c[l>>2]=j+1;a[(c[m>>2]|0)+j|0]=i;b[g>>1]=0;j=(c[f>>2]|0)-9|0;i=0}else{j=k+7|0}c[f>>2]=j;if((j|0)==16){j=d+20|0;k=c[j>>2]|0;c[j>>2]=k+1;l=d+8|0;a[(c[l>>2]|0)+k|0]=i;k=(e[g>>1]|0)>>>8&255;m=c[j>>2]|0;c[j>>2]=m+1;a[(c[l>>2]|0)+m|0]=k;b[g>>1]=0;c[f>>2]=0;c[h>>2]=7;return}if((j|0)<=7){c[h>>2]=7;return}l=d+20|0;m=c[l>>2]|0;c[l>>2]=m+1;a[(c[d+8>>2]|0)+m|0]=i;b[g>>1]=(e[g>>1]|0)>>>8;c[f>>2]=(c[f>>2]|0)-8;c[h>>2]=7;return}function Kf(f,g,h,i){f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;if((c[f+132>>2]|0)>0){do{if((h|0)!=0){j=(c[f>>2]|0)+44|0;if((c[j>>2]|0)==2){k=0}else{break}while(1){l=k+1|0;if((b[f+148+(k<<2)>>1]|0)!=0){break}if((l|0)<9){k=l}else{k=l;break}}a:do{if((k|0)==9){k=14;while(1){l=k+1|0;if((b[f+148+(k<<2)>>1]|0)!=0){break a}if((l|0)<32){k=l}else{k=l;break}}}}while(0);c[j>>2]=(k|0)==32}}while(0);Lf(f,f+2840|0);Lf(f,f+2852|0);Of(f,f+148|0,c[f+2844>>2]|0);Of(f,f+2440|0,c[f+2856>>2]|0);Lf(f,f+2864|0);j=18;while(1){k=j-1|0;if((b[f+2684+(d[11144+j|0]<<2)+2>>1]|0)!=0){break}if((k|0)>2){j=k}else{j=k;break}}n=f+5800|0;k=(j*3|0)+17+(c[n>>2]|0)|0;c[n>>2]=k;k=(k+10|0)>>>3;n=((c[f+5804>>2]|0)+10|0)>>>3;m=n>>>0>k>>>0?k:n}else{n=h+5|0;m=n;j=0}do{if((h+4|0)>>>0>m>>>0|(g|0)==0){h=f+5820|0;k=c[h>>2]|0;l=(k|0)>13;if((c[f+136>>2]|0)==4|(n|0)==(m|0)){g=i+2|0;m=f+5816|0;j=e[m>>1]|g<<k;b[m>>1]=j;if(l){q=f+20|0;r=c[q>>2]|0;c[q>>2]=r+1;s=f+8|0;a[(c[s>>2]|0)+r|0]=j;r=(e[m>>1]|0)>>>8&255;j=c[q>>2]|0;c[q>>2]=j+1;a[(c[s>>2]|0)+j|0]=r;j=c[h>>2]|0;b[m>>1]=(g&65535)>>>((16-j|0)>>>0);j=j-13|0}else{j=k+3|0}c[h>>2]=j;Mf(f,304,1480);break}o=i+4|0;g=f+5816|0;m=e[g>>1]|o<<k;n=m&65535;b[g>>1]=n;if(l){q=f+20|0;r=c[q>>2]|0;c[q>>2]=r+1;s=f+8|0;a[(c[s>>2]|0)+r|0]=m;r=(e[g>>1]|0)>>>8&255;m=c[q>>2]|0;c[q>>2]=m+1;a[(c[s>>2]|0)+m|0]=r;m=c[h>>2]|0;o=(o&65535)>>>((16-m|0)>>>0)&65535;b[g>>1]=o;m=m-13|0}else{m=k+3|0;o=n}c[h>>2]=m;l=c[f+2844>>2]|0;k=c[f+2856>>2]|0;n=l-256|0;p=o&65535|n<<m;o=p&65535;b[g>>1]=o;if((m|0)>11){r=f+20|0;s=c[r>>2]|0;c[r>>2]=s+1;o=f+8|0;a[(c[o>>2]|0)+s|0]=p;s=(e[g>>1]|0)>>>8&255;m=c[r>>2]|0;c[r>>2]=m+1;a[(c[o>>2]|0)+m|0]=s;m=c[h>>2]|0;o=(n&65535)>>>((16-m|0)>>>0)&65535;b[g>>1]=o;m=m-11|0}else{m=m+5|0}c[h>>2]=m;o=k<<m|o&65535;n=o&65535;b[g>>1]=n;if((m|0)>11){r=f+20|0;m=c[r>>2]|0;c[r>>2]=m+1;s=f+8|0;a[(c[s>>2]|0)+m|0]=o;o=(e[g>>1]|0)>>>8&255;m=c[r>>2]|0;c[r>>2]=m+1;a[(c[s>>2]|0)+m|0]=o;m=c[h>>2]|0;o=(k&65535)>>>((16-m|0)>>>0)&65535;b[g>>1]=o;m=m-11|0}else{m=m+5|0;o=n}c[h>>2]=m;n=j-3|0;o=n<<m|o&65535;r=o&65535;b[g>>1]=r;if((m|0)>12){q=f+20|0;s=c[q>>2]|0;c[q>>2]=s+1;r=f+8|0;a[(c[r>>2]|0)+s|0]=o;s=(e[g>>1]|0)>>>8&255;p=c[q>>2]|0;c[q>>2]=p+1;a[(c[r>>2]|0)+p|0]=s;p=c[h>>2]|0;r=(n&65535)>>>((16-p|0)>>>0)&65535;b[g>>1]=r;p=p-12|0}else{p=m+4|0}c[h>>2]=p;if((j|0)>-1){m=f+20|0;n=f+8|0;o=0;while(1){q=e[f+2684+(d[11144+o|0]<<2)+2>>1]|0;s=q<<p|r&65535;r=s&65535;b[g>>1]=r;if((p|0)>13){r=c[m>>2]|0;c[m>>2]=r+1;a[(c[n>>2]|0)+r|0]=s;r=(e[g>>1]|0)>>>8&255;p=c[m>>2]|0;c[m>>2]=p+1;a[(c[n>>2]|0)+p|0]=r;p=c[h>>2]|0;r=q>>>((16-p|0)>>>0)&65535;b[g>>1]=r;p=p-13|0}else{p=p+3|0}c[h>>2]=p;if((o|0)<(j|0)){o=o+1|0}else{break}}}r=f+148|0;Nf(f,r,l);s=f+2440|0;Nf(f,s,k);Mf(f,r,s)}else{If(f,g,h,i)}}while(0);Hf(f);if((i|0)==0){return}i=f+5820|0;h=c[i>>2]|0;do{if((h|0)>8){j=f+5816|0;s=b[j>>1]&255;p=f+20|0;q=c[p>>2]|0;c[p>>2]=q+1;r=f+8|0;a[(c[r>>2]|0)+q|0]=s;q=(e[j>>1]|0)>>>8&255;s=c[p>>2]|0;c[p>>2]=s+1;a[(c[r>>2]|0)+s|0]=q}else{j=f+5816|0;if((h|0)<=0){break}r=b[j>>1]&255;q=f+20|0;s=c[q>>2]|0;c[q>>2]=s+1;a[(c[f+8>>2]|0)+s|0]=r}}while(0);b[j>>1]=0;c[i>>2]=0;return}function Lf(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;j=i;i=i+32|0;h=j|0;p=g|0;k=c[p>>2]|0;n=g+8|0;q=c[n>>2]|0;r=c[q>>2]|0;q=c[q+12>>2]|0;o=f+5200|0;c[o>>2]=0;m=f+5204|0;c[m>>2]=573;if((q|0)>0){t=0;l=-1;do{if((b[k+(t<<2)>>1]|0)==0){b[k+(t<<2)+2>>1]=0}else{l=(c[o>>2]|0)+1|0;c[o>>2]=l;c[f+2908+(l<<2)>>2]=t;a[f+5208+t|0]=0;l=t}t=t+1|0;}while((t|0)<(q|0));u=c[o>>2]|0;if((u|0)<2){s=3}}else{u=0;l=-1;s=3}if((s|0)==3){s=f+5800|0;t=f+5804|0;if((r|0)==0){do{t=(l|0)<2;r=l+1|0;l=t?r:l;C=t?r:0;u=u+1|0;c[o>>2]=u;c[f+2908+(u<<2)>>2]=C;b[k+(C<<2)>>1]=1;a[f+5208+C|0]=0;c[s>>2]=(c[s>>2]|0)-1;u=c[o>>2]|0;}while((u|0)<2)}else{do{v=(l|0)<2;w=l+1|0;l=v?w:l;C=v?w:0;u=u+1|0;c[o>>2]=u;c[f+2908+(u<<2)>>2]=C;b[k+(C<<2)>>1]=1;a[f+5208+C|0]=0;c[s>>2]=(c[s>>2]|0)-1;c[t>>2]=(c[t>>2]|0)-(e[r+(C<<2)+2>>1]|0);u=c[o>>2]|0;}while((u|0)<2)}}g=g+4|0;c[g>>2]=l;x=c[o>>2]|0;if((x|0)>1){r=(x|0)/2|0;do{s=c[f+2908+(r<<2)>>2]|0;u=f+5208+s|0;w=r<<1;a:do{if((w|0)>(x|0)){t=r}else{v=k+(s<<2)|0;t=r;while(1){do{if((w|0)<(x|0)){x=w|1;y=c[f+2908+(x<<2)>>2]|0;B=b[k+(y<<2)>>1]|0;z=c[f+2908+(w<<2)>>2]|0;A=b[k+(z<<2)>>1]|0;if((B&65535)>>>0>=(A&65535)>>>0){if(B<<16>>16!=A<<16>>16){break}if((d[f+5208+y|0]|0)>>>0>(d[f+5208+z|0]|0)>>>0){break}}w=x}}while(0);y=b[v>>1]|0;x=c[f+2908+(w<<2)>>2]|0;z=b[k+(x<<2)>>1]|0;if((y&65535)>>>0<(z&65535)>>>0){break a}if(y<<16>>16==z<<16>>16){if((d[u]|0)>>>0<=(d[f+5208+x|0]|0)>>>0){break a}}c[f+2908+(t<<2)>>2]=x;y=w<<1;x=c[o>>2]|0;if((y|0)>(x|0)){t=w;break}else{t=w;w=y}}}}while(0);c[f+2908+(t<<2)>>2]=s;r=r-1|0;x=c[o>>2]|0}while((r|0)>0)}r=f+2912|0;while(1){s=c[r>>2]|0;y=x-1|0;c[o>>2]=y;t=c[f+2908+(x<<2)>>2]|0;c[r>>2]=t;u=f+5208+t|0;b:do{if((x|0)<3){w=1}else{v=k+(t<<2)|0;w=1;x=2;while(1){do{if((x|0)<(y|0)){C=x|1;y=c[f+2908+(C<<2)>>2]|0;B=b[k+(y<<2)>>1]|0;z=c[f+2908+(x<<2)>>2]|0;A=b[k+(z<<2)>>1]|0;if((B&65535)>>>0>=(A&65535)>>>0){if(B<<16>>16!=A<<16>>16){break}if((d[f+5208+y|0]|0)>>>0>(d[f+5208+z|0]|0)>>>0){break}}x=C}}while(0);z=b[v>>1]|0;y=c[f+2908+(x<<2)>>2]|0;A=b[k+(y<<2)>>1]|0;if((z&65535)>>>0<(A&65535)>>>0){break b}if(z<<16>>16==A<<16>>16){if((d[u]|0)>>>0<=(d[f+5208+y|0]|0)>>>0){break b}}c[f+2908+(w<<2)>>2]=y;z=x<<1;y=c[o>>2]|0;if((z|0)>(y|0)){w=x;break}else{w=x;x=z}}}}while(0);c[f+2908+(w<<2)>>2]=t;v=c[r>>2]|0;t=(c[m>>2]|0)-1|0;c[m>>2]=t;c[f+2908+(t<<2)>>2]=s;t=(c[m>>2]|0)-1|0;c[m>>2]=t;c[f+2908+(t<<2)>>2]=v;t=k+(q<<2)|0;b[t>>1]=(b[k+(v<<2)>>1]|0)+(b[k+(s<<2)>>1]|0);x=a[f+5208+s|0]|0;w=a[f+5208+v|0]|0;u=f+5208+q|0;a[u]=((x&255)>>>0<(w&255)>>>0?w:x)+1;x=q&65535;b[k+(v<<2)+2>>1]=x;b[k+(s<<2)+2>>1]=x;s=q+1|0;c[r>>2]=q;x=c[o>>2]|0;c:do{if((x|0)<2){v=1}else{v=1;w=2;while(1){do{if((w|0)<(x|0)){y=w|1;z=c[f+2908+(y<<2)>>2]|0;x=b[k+(z<<2)>>1]|0;A=c[f+2908+(w<<2)>>2]|0;B=b[k+(A<<2)>>1]|0;if((x&65535)>>>0>=(B&65535)>>>0){if(x<<16>>16!=B<<16>>16){break}if((d[f+5208+z|0]|0)>>>0>(d[f+5208+A|0]|0)>>>0){break}}w=y}}while(0);y=b[t>>1]|0;x=c[f+2908+(w<<2)>>2]|0;z=b[k+(x<<2)>>1]|0;if((y&65535)>>>0<(z&65535)>>>0){break c}if(y<<16>>16==z<<16>>16){if((d[u]|0)>>>0<=(d[f+5208+x|0]|0)>>>0){break c}}c[f+2908+(v<<2)>>2]=x;y=w<<1;x=c[o>>2]|0;if((y|0)>(x|0)){v=w;break}else{v=w;w=y}}}}while(0);c[f+2908+(v<<2)>>2]=q;x=c[o>>2]|0;if((x|0)>1){q=s}else{break}}s=c[r>>2]|0;o=(c[m>>2]|0)-1|0;c[m>>2]=o;c[f+2908+(o<<2)>>2]=s;o=c[p>>2]|0;p=c[g>>2]|0;g=c[n>>2]|0;s=c[g>>2]|0;q=c[g+4>>2]|0;r=c[g+8>>2]|0;g=c[g+16>>2]|0;n=f+2876|0;Pp(n|0,0,32)|0;b[o+(c[f+2908+(c[m>>2]<<2)>>2]<<2)+2>>1]=0;w=(c[m>>2]|0)+1|0;d:do{if((w|0)<573){m=f+5800|0;t=f+5804|0;if((s|0)==0){v=0;do{s=c[f+2908+(w<<2)>>2]|0;u=o+(s<<2)+2|0;t=e[o+(e[u>>1]<<2)+2>>1]|0;x=(t|0)<(g|0);t=x?t+1|0:g;v=(x&1^1)+v|0;b[u>>1]=t;if((s|0)<=(p|0)){C=f+2876+(t<<1)|0;b[C>>1]=(b[C>>1]|0)+1;if((s|0)<(r|0)){u=0}else{u=c[q+(s-r<<2)>>2]|0}C=ha(e[o+(s<<2)>>1]|0,u+t|0)|0;c[m>>2]=C+(c[m>>2]|0)}w=w+1|0;}while((w|0)<573)}else{v=0;do{u=c[f+2908+(w<<2)>>2]|0;y=o+(u<<2)+2|0;x=e[o+(e[y>>1]<<2)+2>>1]|0;z=(x|0)<(g|0);x=z?x+1|0:g;v=(z&1^1)+v|0;b[y>>1]=x;if((u|0)<=(p|0)){C=f+2876+(x<<1)|0;b[C>>1]=(b[C>>1]|0)+1;if((u|0)<(r|0)){y=0}else{y=c[q+(u-r<<2)>>2]|0}C=e[o+(u<<2)>>1]|0;B=ha(C,y+x|0)|0;c[m>>2]=B+(c[m>>2]|0);C=ha((e[s+(u<<2)+2>>1]|0)+y|0,C)|0;c[t>>2]=C+(c[t>>2]|0)}w=w+1|0;}while((w|0)<573)}if((v|0)==0){break}q=f+2876+(g<<1)|0;do{r=g;while(1){s=r-1|0;u=f+2876+(s<<1)|0;t=b[u>>1]|0;if(t<<16>>16==0){r=s}else{break}}b[u>>1]=t-1;r=f+2876+(r<<1)|0;b[r>>1]=(b[r>>1]|0)+2;r=(b[q>>1]|0)-1&65535;b[q>>1]=r;v=v-2|0;}while((v|0)>0);if((g|0)==0){break}else{s=573}while(1){q=g&65535;if(r<<16>>16!=0){r=r&65535;do{do{s=s-1|0;u=c[f+2908+(s<<2)>>2]|0;}while((u|0)>(p|0));v=o+(u<<2)+2|0;t=e[v>>1]|0;if((t|0)!=(g|0)){C=ha(e[o+(u<<2)>>1]|0,g-t|0)|0;c[m>>2]=C+(c[m>>2]|0);b[v>>1]=q}r=r-1|0;}while((r|0)!=0)}q=g-1|0;if((q|0)==0){break d}g=q;r=b[f+2876+(q<<1)>>1]|0}}}while(0);C=b[n>>1]<<1;b[h+2>>1]=C;C=((b[f+2878>>1]|0)+C&65535)<<1;b[h+4>>1]=C;C=(C+(b[f+2880>>1]|0)&65535)<<1;b[h+6>>1]=C;C=(C+(b[f+2882>>1]|0)&65535)<<1;b[h+8>>1]=C;C=(C+(b[f+2884>>1]|0)&65535)<<1;b[h+10>>1]=C;C=(C+(b[f+2886>>1]|0)&65535)<<1;b[h+12>>1]=C;C=(C+(b[f+2888>>1]|0)&65535)<<1;b[h+14>>1]=C;C=(C+(b[f+2890>>1]|0)&65535)<<1;b[h+16>>1]=C;C=(C+(b[f+2892>>1]|0)&65535)<<1;b[h+18>>1]=C;C=(C+(b[f+2894>>1]|0)&65535)<<1;b[h+20>>1]=C;C=(C+(b[f+2896>>1]|0)&65535)<<1;b[h+22>>1]=C;C=(C+(b[f+2898>>1]|0)&65535)<<1;b[h+24>>1]=C;C=(C+(b[f+2900>>1]|0)&65535)<<1;b[h+26>>1]=C;C=(C+(b[f+2902>>1]|0)&65535)<<1;b[h+28>>1]=C;b[h+30>>1]=(C+(b[f+2904>>1]|0)&65535)<<1;if((l|0)<0){i=j;return}else{f=0}while(1){C=b[k+(f<<2)+2>>1]|0;o=C&65535;if(C<<16>>16!=0){n=h+(o<<1)|0;m=b[n>>1]|0;b[n>>1]=m+1;n=0;m=m&65535;while(1){n=n|m&1;o=o-1|0;if((o|0)>0){n=n<<1;m=m>>>1}else{break}}b[k+(f<<2)>>1]=n}if((f|0)<(l|0)){f=f+1|0}else{break}}i=j;return}function Mf(f,g,h){f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;i=f+5792|0;if((c[i>>2]|0)==0){r=c[f+5820>>2]|0;t=b[f+5816>>1]|0}else{n=f+5796|0;o=f+5784|0;m=f+5820|0;l=f+5816|0;j=f+20|0;k=f+8|0;r=0;while(1){x=b[(c[n>>2]|0)+(r<<1)>>1]|0;q=x&65535;p=r+1|0;r=d[(c[o>>2]|0)+r|0]|0;do{if(x<<16>>16==0){q=e[g+(r<<2)+2>>1]|0;s=c[m>>2]|0;u=e[g+(r<<2)>>1]|0;r=e[l>>1]|0|u<<s;t=r&65535;b[l>>1]=t;if((s|0)>(16-q|0)){t=c[j>>2]|0;c[j>>2]=t+1;a[(c[k>>2]|0)+t|0]=r;t=(e[l>>1]|0)>>>8&255;r=c[j>>2]|0;c[j>>2]=r+1;a[(c[k>>2]|0)+r|0]=t;r=c[m>>2]|0;t=u>>>((16-r|0)>>>0)&65535;b[l>>1]=t;r=q-16+r|0;c[m>>2]=r;break}else{r=s+q|0;c[m>>2]=r;break}}else{s=d[18456+r|0]|0;v=(s|256)+1|0;t=e[g+(v<<2)+2>>1]|0;x=c[m>>2]|0;v=e[g+(v<<2)>>1]|0;w=e[l>>1]|0|v<<x;u=w&65535;b[l>>1]=u;if((x|0)>(16-t|0)){x=c[j>>2]|0;c[j>>2]=x+1;a[(c[k>>2]|0)+x|0]=w;w=(e[l>>1]|0)>>>8&255;x=c[j>>2]|0;c[j>>2]=x+1;a[(c[k>>2]|0)+x|0]=w;x=c[m>>2]|0;v=v>>>((16-x|0)>>>0)&65535;b[l>>1]=v;t=t-16+x|0}else{t=x+t|0;v=u}c[m>>2]=t;u=c[2472+(s<<2)>>2]|0;do{if((s-8|0)>>>0<20>>>0){r=r-(c[11168+(s<<2)>>2]|0)|0;s=v&65535|r<<t;v=s&65535;b[l>>1]=v;if((t|0)>(16-u|0)){v=c[j>>2]|0;c[j>>2]=v+1;a[(c[k>>2]|0)+v|0]=s;v=(e[l>>1]|0)>>>8&255;x=c[j>>2]|0;c[j>>2]=x+1;a[(c[k>>2]|0)+x|0]=v;x=c[m>>2]|0;v=(r&65535)>>>((16-x|0)>>>0)&65535;b[l>>1]=v;r=u-16+x|0;c[m>>2]=r;break}else{r=t+u|0;c[m>>2]=r;break}}else{r=t}}while(0);q=q-1|0;if(q>>>0<256>>>0){s=q}else{s=(q>>>7)+256|0}s=d[18712+s|0]|0;u=e[h+(s<<2)+2>>1]|0;w=e[h+(s<<2)>>1]|0;v=v&65535|w<<r;t=v&65535;b[l>>1]=t;if((r|0)>(16-u|0)){t=c[j>>2]|0;c[j>>2]=t+1;a[(c[k>>2]|0)+t|0]=v;t=(e[l>>1]|0)>>>8&255;r=c[j>>2]|0;c[j>>2]=r+1;a[(c[k>>2]|0)+r|0]=t;r=c[m>>2]|0;t=w>>>((16-r|0)>>>0)&65535;b[l>>1]=t;r=u-16+r|0}else{r=r+u|0}c[m>>2]=r;u=c[2592+(s<<2)>>2]|0;if((s-4|0)>>>0>=26>>>0){break}q=q-(c[11288+(s<<2)>>2]|0)|0;s=t&65535|q<<r;t=s&65535;b[l>>1]=t;if((r|0)>(16-u|0)){t=c[j>>2]|0;c[j>>2]=t+1;a[(c[k>>2]|0)+t|0]=s;t=(e[l>>1]|0)>>>8&255;r=c[j>>2]|0;c[j>>2]=r+1;a[(c[k>>2]|0)+r|0]=t;r=c[m>>2]|0;t=(q&65535)>>>((16-r|0)>>>0)&65535;b[l>>1]=t;r=u-16+r|0;c[m>>2]=r;break}else{r=r+u|0;c[m>>2]=r;break}}}while(0);if(p>>>0<(c[i>>2]|0)>>>0){r=p}else{break}}}h=g+1026|0;i=e[h>>1]|0;j=f+5820|0;g=e[g+1024>>1]|0;k=f+5816|0;l=t&65535|g<<r;b[k>>1]=l;if((r|0)>(16-i|0)){u=f+20|0;v=c[u>>2]|0;c[u>>2]=v+1;x=f+8|0;a[(c[x>>2]|0)+v|0]=l;v=(e[k>>1]|0)>>>8&255;w=c[u>>2]|0;c[u>>2]=w+1;a[(c[x>>2]|0)+w|0]=v;w=c[j>>2]|0;b[k>>1]=g>>>((16-w|0)>>>0);w=i-16+w|0;c[j>>2]=w;w=b[h>>1]|0;w=w&65535;x=f+5812|0;c[x>>2]=w;return}else{w=r+i|0;c[j>>2]=w;w=b[h>>1]|0;w=w&65535;x=f+5812|0;c[x>>2]=w;return}}function Nf(d,f,g){d=d|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;j=b[f+2>>1]|0;s=j<<16>>16==0;m=d+2754|0;q=d+5820|0;h=d+2752|0;r=d+5816|0;n=d+20|0;i=d+8|0;o=d+2758|0;p=d+2756|0;k=d+2750|0;l=d+2748|0;u=0;x=-1;j=j&65535;z=s?138:7;A=s?3:4;a:while(1){w=0;while(1){if((u|0)>(g|0)){break a}u=u+1|0;v=b[f+(u<<2)+2>>1]|0;t=v&65535;y=w+1|0;s=(j|0)==(t|0);if((y|0)<(z|0)&s){w=y}else{break}}do{if((y|0)<(A|0)){w=d+2684+(j<<2)+2|0;x=d+2684+(j<<2)|0;z=c[q>>2]|0;C=b[r>>1]|0;do{A=e[w>>1]|0;B=e[x>>1]|0;D=C&65535|B<<z;C=D&65535;b[r>>1]=C;if((z|0)>(16-A|0)){C=c[n>>2]|0;c[n>>2]=C+1;a[(c[i>>2]|0)+C|0]=D;C=(e[r>>1]|0)>>>8&255;z=c[n>>2]|0;c[n>>2]=z+1;a[(c[i>>2]|0)+z|0]=C;z=c[q>>2]|0;C=B>>>((16-z|0)>>>0)&65535;b[r>>1]=C;z=A-16+z|0}else{z=z+A|0}c[q>>2]=z;y=y-1|0;}while((y|0)!=0)}else{if((j|0)!=0){if((j|0)==(x|0)){w=y;x=c[q>>2]|0;y=b[r>>1]|0}else{A=e[d+2684+(j<<2)+2>>1]|0;B=c[q>>2]|0;z=e[d+2684+(j<<2)>>1]|0;x=e[r>>1]|0|z<<B;y=x&65535;b[r>>1]=y;if((B|0)>(16-A|0)){y=c[n>>2]|0;c[n>>2]=y+1;a[(c[i>>2]|0)+y|0]=x;y=(e[r>>1]|0)>>>8&255;x=c[n>>2]|0;c[n>>2]=x+1;a[(c[i>>2]|0)+x|0]=y;x=c[q>>2]|0;y=z>>>((16-x|0)>>>0)&65535;b[r>>1]=y;x=A-16+x|0}else{x=B+A|0}c[q>>2]=x}A=e[k>>1]|0;z=e[l>>1]|0;B=y&65535|z<<x;y=B&65535;b[r>>1]=y;if((x|0)>(16-A|0)){y=c[n>>2]|0;c[n>>2]=y+1;a[(c[i>>2]|0)+y|0]=B;y=(e[r>>1]|0)>>>8&255;x=c[n>>2]|0;c[n>>2]=x+1;a[(c[i>>2]|0)+x|0]=y;x=c[q>>2]|0;y=z>>>((16-x|0)>>>0)&65535;b[r>>1]=y;x=A-16+x|0}else{x=x+A|0}c[q>>2]=x;w=w-3|0;y=y&65535|w<<x;b[r>>1]=y;if((x|0)>14){C=c[n>>2]|0;c[n>>2]=C+1;a[(c[i>>2]|0)+C|0]=y;C=(e[r>>1]|0)>>>8&255;D=c[n>>2]|0;c[n>>2]=D+1;a[(c[i>>2]|0)+D|0]=C;D=c[q>>2]|0;b[r>>1]=(w&65535)>>>((16-D|0)>>>0);c[q>>2]=D-14;break}else{c[q>>2]=x+2;break}}if((y|0)<11){y=e[m>>1]|0;B=c[q>>2]|0;z=e[h>>1]|0;A=e[r>>1]|0|z<<B;x=A&65535;b[r>>1]=x;if((B|0)>(16-y|0)){x=c[n>>2]|0;c[n>>2]=x+1;a[(c[i>>2]|0)+x|0]=A;x=(e[r>>1]|0)>>>8&255;D=c[n>>2]|0;c[n>>2]=D+1;a[(c[i>>2]|0)+D|0]=x;D=c[q>>2]|0;x=z>>>((16-D|0)>>>0)&65535;b[r>>1]=x;y=y-16+D|0}else{y=B+y|0}c[q>>2]=y;w=w-2|0;x=x&65535|w<<y;b[r>>1]=x;if((y|0)>13){C=c[n>>2]|0;c[n>>2]=C+1;a[(c[i>>2]|0)+C|0]=x;C=(e[r>>1]|0)>>>8&255;D=c[n>>2]|0;c[n>>2]=D+1;a[(c[i>>2]|0)+D|0]=C;D=c[q>>2]|0;b[r>>1]=(w&65535)>>>((16-D|0)>>>0);c[q>>2]=D-13;break}else{c[q>>2]=y+3;break}}else{B=e[o>>1]|0;z=c[q>>2]|0;A=e[p>>1]|0;y=e[r>>1]|0|A<<z;x=y&65535;b[r>>1]=x;if((z|0)>(16-B|0)){x=c[n>>2]|0;c[n>>2]=x+1;a[(c[i>>2]|0)+x|0]=y;x=(e[r>>1]|0)>>>8&255;y=c[n>>2]|0;c[n>>2]=y+1;a[(c[i>>2]|0)+y|0]=x;y=c[q>>2]|0;x=A>>>((16-y|0)>>>0)&65535;b[r>>1]=x;y=B-16+y|0}else{y=z+B|0}c[q>>2]=y;w=w-10|0;x=x&65535|w<<y;b[r>>1]=x;if((y|0)>9){C=c[n>>2]|0;c[n>>2]=C+1;a[(c[i>>2]|0)+C|0]=x;C=(e[r>>1]|0)>>>8&255;D=c[n>>2]|0;c[n>>2]=D+1;a[(c[i>>2]|0)+D|0]=C;D=c[q>>2]|0;b[r>>1]=(w&65535)>>>((16-D|0)>>>0);c[q>>2]=D-9;break}else{c[q>>2]=y+7;break}}}}while(0);if(v<<16>>16==0){x=j;j=t;z=138;A=3;continue}x=j;j=t;z=s?6:7;A=s?3:4}return}function Of(a,c,d){a=a|0;c=c|0;d=d|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=b[c+2>>1]|0;j=k<<16>>16==0;b[c+(d+1<<2)+2>>1]=-1;i=a+2752|0;f=a+2756|0;g=a+2748|0;h=j?3:4;j=j?138:7;l=k&65535;n=0;m=-1;a:while(1){k=0;do{if((n|0)>(d|0)){break a}n=n+1|0;q=b[c+(n<<2)+2>>1]|0;o=q&65535;k=k+1|0;p=(l|0)==(o|0);}while((k|0)<(j|0)&p);do{if((k|0)<(h|0)){m=a+2684+(l<<2)|0;b[m>>1]=(e[m>>1]|0)+k}else{if((l|0)==0){if((k|0)<11){b[i>>1]=(b[i>>1]|0)+1;break}else{b[f>>1]=(b[f>>1]|0)+1;break}}else{if((l|0)!=(m|0)){m=a+2684+(l<<2)|0;b[m>>1]=(b[m>>1]|0)+1}b[g>>1]=(b[g>>1]|0)+1;break}}}while(0);if(q<<16>>16==0){h=3;j=138;m=l;l=o;continue}h=p?3:4;j=p?6:7;m=l;l=o}return}function Pf(a,b,c){a=a|0;b=b|0;c=c|0;return qp(ha(c,b)|0)|0}function Qf(a,b){a=a|0;b=b|0;rp(b);return}function Rf(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=a>>>16;a=a&65535;if((c|0)==1){e=(d[b]|0)+a|0;e=e>>>0>65520>>>0?e-65521|0:e;f=e+f|0;h=(f>>>0>65520>>>0?f+15|0:f)<<16|e;return h|0}if((b|0)==0){h=1;return h|0}if(c>>>0<16>>>0){if((c|0)!=0){while(1){c=c-1|0;a=(d[b]|0)+a|0;f=a+f|0;if((c|0)==0){break}else{b=b+1|0}}}h=((f>>>0)%65521|0)<<16|(a>>>0>65520>>>0?a-65521|0:a);return h|0}do{if(c>>>0>5551>>>0){do{c=c-5552|0;g=347;h=b;while(1){w=(d[h]|0)+a|0;v=w+(d[h+1|0]|0)|0;u=v+(d[h+2|0]|0)|0;t=u+(d[h+3|0]|0)|0;s=t+(d[h+4|0]|0)|0;r=s+(d[h+5|0]|0)|0;q=r+(d[h+6|0]|0)|0;p=q+(d[h+7|0]|0)|0;o=p+(d[h+8|0]|0)|0;n=o+(d[h+9|0]|0)|0;m=n+(d[h+10|0]|0)|0;l=m+(d[h+11|0]|0)|0;k=l+(d[h+12|0]|0)|0;j=k+(d[h+13|0]|0)|0;i=j+(d[h+14|0]|0)|0;a=i+(d[h+15|0]|0)|0;f=w+f+v+u+t+s+r+q+p+o+n+m+l+k+j+i+a|0;g=g-1|0;if((g|0)==0){break}else{h=h+16|0}}b=b+5552|0;a=(a>>>0)%65521|0;f=(f>>>0)%65521|0;}while(c>>>0>5551>>>0);if((c|0)==0){break}if(c>>>0>15>>>0){e=15}else{e=16}}else{e=15}}while(0);if((e|0)==15){while(1){c=c-16|0;i=(d[b]|0)+a|0;j=i+(d[b+1|0]|0)|0;k=j+(d[b+2|0]|0)|0;l=k+(d[b+3|0]|0)|0;m=l+(d[b+4|0]|0)|0;n=m+(d[b+5|0]|0)|0;o=n+(d[b+6|0]|0)|0;p=o+(d[b+7|0]|0)|0;q=p+(d[b+8|0]|0)|0;r=q+(d[b+9|0]|0)|0;s=r+(d[b+10|0]|0)|0;t=s+(d[b+11|0]|0)|0;u=t+(d[b+12|0]|0)|0;v=u+(d[b+13|0]|0)|0;w=v+(d[b+14|0]|0)|0;a=w+(d[b+15|0]|0)|0;f=i+f+j+k+l+m+n+o+p+q+r+s+t+u+v+w+a|0;b=b+16|0;if(c>>>0>15>>>0){e=15}else{break}}if((c|0)==0){e=17}else{e=16}}if((e|0)==16){while(1){c=c-1|0;a=(d[b]|0)+a|0;f=a+f|0;if((c|0)==0){e=17;break}else{b=b+1|0;e=16}}}if((e|0)==17){f=(f>>>0)%65521|0;a=(a>>>0)%65521|0}w=f<<16|a;return w|0}function Sf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+32|0;d=b|0;e=b+8|0;g=b+16|0;k=b+24|0;f=c[o>>2]|0;mg(30232,f,30360);c[7806]=21732;c[7808]=21752;c[7807]=0;y=0;qa(70,31232,30232);if(y){y=0;j=Mb(-1,-1)|0;rh(31232);db(j|0)}c[7826]=0;c[7827]=-1;h=c[r>>2]|0;c[7534]=21512;Bm(30140);Pp(30144,0,24)|0;c[7534]=21880;c[7542]=h;Cm(k,30140);j=(y=0,Da(54,k|0,30560)|0);if(y){y=0;l=Mb(-1,-1)|0;Dm(k);c[7534]=21512;Dm(30140);db(l|0)}l=j;Dm(k);c[7543]=l;c[7544]=30368;a[30180]=(Ac[c[(c[j>>2]|0)+28>>2]&255](l)|0)&1;c[7740]=21636;c[7741]=21656;y=0;qa(70,30964,30136);if(y){y=0;l=Mb(-1,-1)|0;rh(30964);db(l|0)}c[7759]=0;c[7760]=-1;j=c[q>>2]|0;c[7546]=21512;Bm(30188);Pp(30192,0,24)|0;c[7546]=21880;c[7554]=j;Cm(g,30188);k=(y=0,Da(54,g|0,30560)|0);if(y){y=0;l=Mb(-1,-1)|0;Dm(g);c[7546]=21512;Dm(30188);db(l|0)}l=k;Dm(g);c[7555]=l;c[7556]=30376;a[30228]=(Ac[c[(c[k>>2]|0)+28>>2]&255](l)|0)&1;c[7784]=21636;c[7785]=21656;y=0;qa(70,31140,30184);if(y){y=0;l=Mb(-1,-1)|0;rh(31140);db(l|0)}c[7803]=0;c[7804]=-1;l=c[(c[(c[7784]|0)-12>>2]|0)+31160>>2]|0;c[7762]=21636;c[7763]=21656;y=0;qa(70,31052,l|0);if(y){y=0;l=Mb(-1,-1)|0;rh(31052);db(l|0)}c[7781]=0;c[7782]=-1;c[(c[(c[7806]|0)-12>>2]|0)+31296>>2]=30960;l=(c[(c[7784]|0)-12>>2]|0)+31140|0;c[l>>2]=c[l>>2]|8192;c[(c[(c[7784]|0)-12>>2]|0)+31208>>2]=30960;_f(30080,f,30384);c[7718]=21684;c[7720]=21704;c[7719]=0;y=0;qa(70,30880,30080);if(y){y=0;l=Mb(-1,-1)|0;rh(30880);db(l|0)}c[7738]=0;c[7739]=-1;c[7496]=21440;Bm(29988);Pp(29992,0,24)|0;c[7496]=21808;c[7504]=h;Cm(e,29988);f=(y=0,Da(54,e|0,30552)|0);if(y){y=0;l=Mb(-1,-1)|0;Dm(e);c[7496]=21440;Dm(29988);db(l|0)}l=f;Dm(e);c[7505]=l;c[7506]=30392;a[30028]=(Ac[c[(c[f>>2]|0)+28>>2]&255](l)|0)&1;c[7648]=21588;c[7649]=21608;y=0;qa(70,30596,29984);if(y){y=0;l=Mb(-1,-1)|0;rh(30596);db(l|0)}c[7667]=0;c[7668]=-1;c[7508]=21440;Bm(30036);Pp(30040,0,24)|0;c[7508]=21808;c[7516]=j;Cm(d,30036);e=(y=0,Da(54,d|0,30552)|0);if(y){y=0;l=Mb(-1,-1)|0;Dm(d);c[7508]=21440;Dm(30036);db(l|0)}l=e;Dm(d);c[7517]=l;c[7518]=30400;a[30076]=(Ac[c[(c[e>>2]|0)+28>>2]&255](l)|0)&1;c[7692]=21588;c[7693]=21608;y=0;qa(70,30772,30032);if(y){y=0;l=Mb(-1,-1)|0;rh(30772);db(l|0)}c[7711]=0;c[7712]=-1;l=c[(c[(c[7692]|0)-12>>2]|0)+30792>>2]|0;c[7670]=21588;c[7671]=21608;y=0;qa(70,30684,l|0);if(!y){c[7689]=0;c[7690]=-1;c[(c[(c[7718]|0)-12>>2]|0)+30944>>2]=30592;l=(c[(c[7692]|0)-12>>2]|0)+30772|0;c[l>>2]=c[l>>2]|8192;c[(c[(c[7692]|0)-12>>2]|0)+30840>>2]=30592;i=b;return}else{y=0;l=Mb(-1,-1)|0;rh(30684);db(l|0)}}function Tf(a){a=a|0;y=0,ra(80,30960)|0;do{if(!y){y=0,ra(80,31048)|0;if(y){y=0;break}y=0,ra(34,30592)|0;if(y){y=0;break}y=0,ra(34,30680)|0;if(y){y=0;break}return}else{y=0}}while(0);a=Mb(-1,-1,0)|0;nd(a)}function Uf(a){a=a|0;c[a>>2]=21440;Dm(a+4|0);return}function Vf(a){a=a|0;c[a>>2]=21440;Dm(a+4|0);xp(a);return}function Wf(b,d){b=b|0;d=d|0;var e=0;Ac[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=Em(d,30552)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(Ac[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function Xf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+16|0;j=b|0;d=b+8|0;e=a+36|0;f=a+40|0;g=j|0;h=j+8|0;a=a+32|0;while(1){k=c[e>>2]|0;k=Pc[c[(c[k>>2]|0)+20>>2]&31](k,c[f>>2]|0,g,h,d)|0;l=(c[d>>2]|0)-j|0;if((Ua(g|0,1,l|0,c[a>>2]|0)|0)!=(l|0)){e=-1;d=5;break}if((k|0)==2){e=-1;d=5;break}else if((k|0)!=1){d=4;break}}if((d|0)==4){l=((Sa(c[a>>2]|0)|0)!=0)<<31>>31;i=b;return l|0}else if((d|0)==5){i=b;return e|0}return 0}function Yf(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if((a[b+44|0]&1)!=0){g=Ua(d|0,4,e|0,c[b+32>>2]|0)|0;return g|0}f=b;if((e|0)>0){g=0}else{g=0;return g|0}while(1){if((Mc[c[(c[f>>2]|0)+52>>2]&63](b,c[d>>2]|0)|0)==-1){b=6;break}g=g+1|0;if((g|0)<(e|0)){d=d+4|0}else{b=6;break}}if((b|0)==6){return g|0}return 0}function Zf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;o=e|0;p=e+8|0;j=e+16|0;h=e+24|0;f=(d|0)==-1;a:do{if(!f){c[p>>2]=d;if((a[b+44|0]&1)!=0){if((Ua(p|0,4,1,c[b+32>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}n=o|0;c[j>>2]=n;k=p+4|0;m=b+36|0;l=b+40|0;g=o+8|0;b=b+32|0;while(1){q=c[m>>2]|0;q=Sc[c[(c[q>>2]|0)+12>>2]&31](q,c[l>>2]|0,p,k,h,n,g,j)|0;if((c[h>>2]|0)==(p|0)){d=-1;g=12;break}if((q|0)==3){g=7;break}r=(q|0)==1;if(q>>>0>=2>>>0){d=-1;g=12;break}q=(c[j>>2]|0)-o|0;if((Ua(n|0,1,q|0,c[b>>2]|0)|0)!=(q|0)){d=-1;g=12;break}if(r){p=r?c[h>>2]|0:p}else{break a}}if((g|0)==7){if((Ua(p|0,1,1,c[b>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}else if((g|0)==12){i=e;return d|0}}}while(0);r=f?0:d;i=e;return r|0}function _f(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;f=g|0;h=b|0;c[h>>2]=21440;j=b+4|0;Bm(j);Pp(b+8|0,0,24)|0;c[h>>2]=22208;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Cm(f,j);e=(y=0,Da(54,f|0,30552)|0);if(y){y=0;d=Mb(-1,-1)|0;Dm(f);c[h>>2]=21440;Dm(j);db(d|0)}l=e;k=b+36|0;c[k>>2]=l;d=b+44|0;c[d>>2]=Ac[c[(c[e>>2]|0)+24>>2]&255](l)|0;e=c[k>>2]|0;a[b+53|0]=(Ac[c[(c[e>>2]|0)+28>>2]&255](e)|0)&1;if((c[d>>2]|0)<=8){Dm(f);i=g;return}y=0;pa(78,11472);if(!y){Dm(f);i=g;return}else{y=0;l=Mb(-1,-1)|0;Dm(f);c[h>>2]=21440;Dm(j);db(l|0)}}function $f(a){a=a|0;c[a>>2]=21440;Dm(a+4|0);return}function ag(a){a=a|0;c[a>>2]=21440;Dm(a+4|0);xp(a);return}function bg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;g=Em(d,30552)|0;f=g;e=b+36|0;c[e>>2]=f;d=b+44|0;c[d>>2]=Ac[c[(c[g>>2]|0)+24>>2]&255](f)|0;e=c[e>>2]|0;a[b+53|0]=(Ac[c[(c[e>>2]|0)+28>>2]&255](e)|0)&1;if((c[d>>2]|0)<=8){return}Nl(11472);return}function cg(a){a=a|0;return fg(a,0)|0}function dg(a){a=a|0;return fg(a,1)|0}function eg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;k=e|0;g=e+8|0;l=e+16|0;m=e+24|0;f=b+52|0;j=(a[f]&1)!=0;if((d|0)==-1){if(j){m=-1;i=e;return m|0}m=c[b+48>>2]|0;a[f]=(m|0)!=-1|0;i=e;return m|0}h=b+48|0;a:do{if(j){c[l>>2]=c[h>>2];n=c[b+36>>2]|0;j=k|0;l=Sc[c[(c[n>>2]|0)+12>>2]&31](n,c[b+40>>2]|0,l,l+4|0,m,j,k+8|0,g)|0;if((l|0)==3){a[j]=c[h>>2];c[g>>2]=k+1}else if((l|0)==2|(l|0)==1){n=-1;i=e;return n|0}b=b+32|0;while(1){k=c[g>>2]|0;if(k>>>0<=j>>>0){break a}n=k-1|0;c[g>>2]=n;if((Zb(a[n]|0,c[b>>2]|0)|0)==-1){f=-1;break}}i=e;return f|0}}while(0);c[h>>2]=d;a[f]=1;n=d;i=e;return n|0}function fg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=i;i=i+32|0;f=e|0;h=e+8|0;m=e+16|0;l=e+24|0;n=b+52|0;if((a[n]&1)!=0){f=b+48|0;g=c[f>>2]|0;if(!d){w=g;i=e;return w|0}c[f>>2]=-1;a[n]=0;w=g;i=e;return w|0}n=c[b+44>>2]|0;t=(n|0)>1?n:1;a:do{if((t|0)>0){p=b+32|0;n=0;while(1){o=hb(c[p>>2]|0)|0;if((o|0)==-1){g=-1;break}a[f+n|0]=o;n=n+1|0;if((n|0)>=(t|0)){break a}}i=e;return g|0}}while(0);b:do{if((a[b+53|0]&1)==0){o=b+40|0;n=b+36|0;r=f|0;q=h+4|0;p=b+32|0;while(1){v=c[o>>2]|0;w=v;u=c[w>>2]|0;w=c[w+4>>2]|0;x=c[n>>2]|0;s=f+t|0;v=Sc[c[(c[x>>2]|0)+16>>2]&31](x,v,r,s,m,h,q,l)|0;if((v|0)==3){j=14;break}else if((v|0)==2){g=-1;j=22;break}else if((v|0)!=1){k=t;break b}x=c[o>>2]|0;c[x>>2]=u;c[x+4>>2]=w;if((t|0)==8){g=-1;j=22;break}u=hb(c[p>>2]|0)|0;if((u|0)==-1){g=-1;j=22;break}a[s]=u;t=t+1|0}if((j|0)==14){c[h>>2]=a[r]|0;k=t;break}else if((j|0)==22){i=e;return g|0}}else{c[h>>2]=a[f|0]|0;k=t}}while(0);if(d){x=c[h>>2]|0;c[b+48>>2]=x;i=e;return x|0}d=b+32|0;while(1){if((k|0)<=0){break}k=k-1|0;if((Zb(a[f+k|0]|0,c[d>>2]|0)|0)==-1){g=-1;j=22;break}}if((j|0)==22){i=e;return g|0}x=c[h>>2]|0;i=e;return x|0}function gg(a){a=a|0;c[a>>2]=21512;Dm(a+4|0);return}function hg(a){a=a|0;c[a>>2]=21512;Dm(a+4|0);xp(a);return}function ig(b,d){b=b|0;d=d|0;var e=0;Ac[c[(c[b>>2]|0)+24>>2]&255](b)|0;e=Em(d,30560)|0;d=e;c[b+36>>2]=d;a[b+44|0]=(Ac[c[(c[e>>2]|0)+28>>2]&255](d)|0)&1;return}function jg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+16|0;j=b|0;d=b+8|0;e=a+36|0;f=a+40|0;g=j|0;h=j+8|0;a=a+32|0;while(1){k=c[e>>2]|0;k=Pc[c[(c[k>>2]|0)+20>>2]&31](k,c[f>>2]|0,g,h,d)|0;l=(c[d>>2]|0)-j|0;if((Ua(g|0,1,l|0,c[a>>2]|0)|0)!=(l|0)){e=-1;d=5;break}if((k|0)==2){e=-1;d=5;break}else if((k|0)!=1){d=4;break}}if((d|0)==4){l=((Sa(c[a>>2]|0)|0)!=0)<<31>>31;i=b;return l|0}else if((d|0)==5){i=b;return e|0}return 0}function kg(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0;if((a[b+44|0]&1)!=0){h=Ua(e|0,1,f|0,c[b+32>>2]|0)|0;return h|0}g=b;if((f|0)>0){h=0}else{h=0;return h|0}while(1){if((Mc[c[(c[g>>2]|0)+52>>2]&63](b,d[e]|0)|0)==-1){b=6;break}h=h+1|0;if((h|0)<(f|0)){e=e+1|0}else{b=6;break}}if((b|0)==6){return h|0}return 0}function lg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+32|0;o=e|0;p=e+8|0;j=e+16|0;h=e+24|0;f=(d|0)==-1;a:do{if(!f){a[p]=d;if((a[b+44|0]&1)!=0){if((Ua(p|0,1,1,c[b+32>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}n=o|0;c[j>>2]=n;k=p+1|0;m=b+36|0;l=b+40|0;g=o+8|0;b=b+32|0;while(1){q=c[m>>2]|0;q=Sc[c[(c[q>>2]|0)+12>>2]&31](q,c[l>>2]|0,p,k,h,n,g,j)|0;if((c[h>>2]|0)==(p|0)){d=-1;g=12;break}if((q|0)==3){g=7;break}r=(q|0)==1;if(q>>>0>=2>>>0){d=-1;g=12;break}q=(c[j>>2]|0)-o|0;if((Ua(n|0,1,q|0,c[b>>2]|0)|0)!=(q|0)){d=-1;g=12;break}if(r){p=r?c[h>>2]|0:p}else{break a}}if((g|0)==7){if((Ua(p|0,1,1,c[b>>2]|0)|0)==1){break}else{d=-1}i=e;return d|0}else if((g|0)==12){i=e;return d|0}}}while(0);r=f?0:d;i=e;return r|0}function mg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;f=g|0;h=b|0;c[h>>2]=21512;j=b+4|0;Bm(j);Pp(b+8|0,0,24)|0;c[h>>2]=22280;c[b+32>>2]=d;c[b+40>>2]=e;c[b+48>>2]=-1;a[b+52|0]=0;Cm(f,j);e=(y=0,Da(54,f|0,30560)|0);if(y){y=0;d=Mb(-1,-1)|0;Dm(f);c[h>>2]=21512;Dm(j);db(d|0)}l=e;k=b+36|0;c[k>>2]=l;d=b+44|0;c[d>>2]=Ac[c[(c[e>>2]|0)+24>>2]&255](l)|0;e=c[k>>2]|0;a[b+53|0]=(Ac[c[(c[e>>2]|0)+28>>2]&255](e)|0)&1;if((c[d>>2]|0)<=8){Dm(f);i=g;return}y=0;pa(78,11472);if(!y){Dm(f);i=g;return}else{y=0;l=Mb(-1,-1)|0;Dm(f);c[h>>2]=21512;Dm(j);db(l|0)}}function ng(a){a=a|0;c[a>>2]=21512;Dm(a+4|0);return}function og(a){a=a|0;c[a>>2]=21512;Dm(a+4|0);xp(a);return}function pg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;g=Em(d,30560)|0;f=g;e=b+36|0;c[e>>2]=f;d=b+44|0;c[d>>2]=Ac[c[(c[g>>2]|0)+24>>2]&255](f)|0;e=c[e>>2]|0;a[b+53|0]=(Ac[c[(c[e>>2]|0)+28>>2]&255](e)|0)&1;if((c[d>>2]|0)<=8){return}Nl(11472);return}function qg(a){a=a|0;return tg(a,0)|0}function rg(a){a=a|0;return tg(a,1)|0}function sg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;i=i+32|0;k=e|0;g=e+8|0;l=e+16|0;m=e+24|0;f=b+52|0;j=(a[f]&1)!=0;if((d|0)==-1){if(j){m=-1;i=e;return m|0}m=c[b+48>>2]|0;a[f]=(m|0)!=-1|0;i=e;return m|0}h=b+48|0;a:do{if(j){a[l]=c[h>>2];n=c[b+36>>2]|0;j=k|0;l=Sc[c[(c[n>>2]|0)+12>>2]&31](n,c[b+40>>2]|0,l,l+1|0,m,j,k+8|0,g)|0;if((l|0)==3){a[j]=c[h>>2];c[g>>2]=k+1}else if((l|0)==2|(l|0)==1){n=-1;i=e;return n|0}b=b+32|0;while(1){k=c[g>>2]|0;if(k>>>0<=j>>>0){break a}n=k-1|0;c[g>>2]=n;if((Zb(a[n]|0,c[b>>2]|0)|0)==-1){f=-1;break}}i=e;return f|0}}while(0);c[h>>2]=d;a[f]=1;n=d;i=e;return n|0}function tg(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+32|0;h=f|0;j=f+8|0;n=f+16|0;m=f+24|0;o=b+52|0;if((a[o]&1)!=0){g=b+48|0;h=c[g>>2]|0;if(!e){x=h;i=f;return x|0}c[g>>2]=-1;a[o]=0;x=h;i=f;return x|0}o=c[b+44>>2]|0;t=(o|0)>1?o:1;a:do{if((t|0)>0){q=b+32|0;o=0;while(1){p=hb(c[q>>2]|0)|0;if((p|0)==-1){k=-1;break}a[h+o|0]=p;o=o+1|0;if((o|0)>=(t|0)){break a}}i=f;return k|0}}while(0);b:do{if((a[b+53|0]&1)==0){r=b+40|0;q=b+36|0;o=h|0;p=j+1|0;s=b+32|0;while(1){w=c[r>>2]|0;x=w;v=c[x>>2]|0;x=c[x+4>>2]|0;y=c[q>>2]|0;u=h+t|0;w=Sc[c[(c[y>>2]|0)+16>>2]&31](y,w,o,u,n,j,p,m)|0;if((w|0)==2){k=-1;m=23;break}else if((w|0)==3){m=14;break}else if((w|0)!=1){l=t;break b}y=c[r>>2]|0;c[y>>2]=v;c[y+4>>2]=x;if((t|0)==8){k=-1;m=23;break}v=hb(c[s>>2]|0)|0;if((v|0)==-1){k=-1;m=23;break}a[u]=v;t=t+1|0}if((m|0)==14){a[j]=a[o]|0;l=t;break}else if((m|0)==23){i=f;return k|0}}else{a[j]=a[h|0]|0;l=t}}while(0);do{if(e){g=a[j]|0;c[b+48>>2]=g&255}else{e=b+32|0;while(1){if((l|0)<=0){m=21;break}l=l-1|0;if((Zb(d[h+l|0]|0|0,c[e>>2]|0)|0)==-1){k=-1;m=23;break}}if((m|0)==21){g=a[j]|0;break}else if((m|0)==23){i=f;return k|0}}}while(0);y=g&255;i=f;return y|0}function ug(){Sf(0);jb(158,31312,v|0)|0;return}function vg(a){a=a|0;return}function wg(a){a=a|0;a=a+4|0;J=c[a>>2]|0,c[a>>2]=J+1,J;return}function xg(a){a=a|0;var b=0;b=a+4|0;if(((J=c[b>>2]|0,c[b>>2]=J+ -1,J)|0)!=0){b=0;return b|0}yc[c[(c[a>>2]|0)+8>>2]&511](a);b=1;return b|0}function yg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=19696;d=Mp(b|0)|0;e=(y=0,ra(146,d+13|0)|0);if(!y){c[e+4>>2]=d;c[e>>2]=d;f=e+12|0;c[a+4>>2]=f;c[e+8>>2]=0;Np(f|0,b|0,d+1|0)|0;return}else{y=0;f=Mb(-1,-1)|0;db(f|0)}}function zg(a){a=a|0;var b=0,d=0;c[a>>2]=19696;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((J=c[d>>2]|0,c[d>>2]=J+ -1,J)-1|0)>=0){d=a;xp(d);return}yp((c[b>>2]|0)-12|0);d=a;xp(d);return}function Ag(a){a=a|0;var b=0;c[a>>2]=19696;a=a+4|0;b=(c[a>>2]|0)-4|0;if(((J=c[b>>2]|0,c[b>>2]=J+ -1,J)-1|0)>=0){return}yp((c[a>>2]|0)-12|0);return}function Bg(a){a=a|0;return c[a+4>>2]|0}function Cg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;c[b>>2]=19600;if((a[d]&1)==0){d=d+1|0}else{d=c[d+8>>2]|0}e=Mp(d|0)|0;f=(y=0,ra(146,e+13|0)|0);if(!y){c[f+4>>2]=e;c[f>>2]=e;g=f+12|0;c[b+4>>2]=g;c[f+8>>2]=0;Np(g|0,d|0,e+1|0)|0;return}else{y=0;g=Mb(-1,-1)|0;db(g|0)}}function Dg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a>>2]=19600;d=Mp(b|0)|0;e=(y=0,ra(146,d+13|0)|0);if(!y){c[e+4>>2]=d;c[e>>2]=d;f=e+12|0;c[a+4>>2]=f;c[e+8>>2]=0;Np(f|0,b|0,d+1|0)|0;return}else{y=0;f=Mb(-1,-1)|0;db(f|0)}}function Eg(a){a=a|0;var b=0,d=0;c[a>>2]=19600;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((J=c[d>>2]|0,c[d>>2]=J+ -1,J)-1|0)>=0){d=a;xp(d);return}yp((c[b>>2]|0)-12|0);d=a;xp(d);return}function Fg(a){a=a|0;var b=0;c[a>>2]=19600;a=a+4|0;b=(c[a>>2]|0)-4|0;if(((J=c[b>>2]|0,c[b>>2]=J+ -1,J)-1|0)>=0){return}yp((c[a>>2]|0)-12|0);return}function Gg(a){a=a|0;return c[a+4>>2]|0}function Hg(a){a=a|0;var b=0,d=0;c[a>>2]=19696;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((J=c[d>>2]|0,c[d>>2]=J+ -1,J)-1|0)>=0){d=a;xp(d);return}yp((c[b>>2]|0)-12|0);d=a;xp(d);return}function Ig(a){a=a|0;var b=0,d=0;c[a>>2]=19696;b=a+4|0;d=(c[b>>2]|0)-4|0;if(((J=c[d>>2]|0,c[d>>2]=J+ -1,J)-1|0)>=0){d=a;xp(d);return}yp((c[b>>2]|0)-12|0);d=a;xp(d);return}function Jg(a){a=a|0;return}function Kg(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=d;c[a+4>>2]=b;return}function Lg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+8|0;f=e|0;Qc[c[(c[a>>2]|0)+12>>2]&31](f,a,b);if((c[f+4>>2]|0)!=(c[d+4>>2]|0)){a=0;i=e;return a|0}a=(c[f>>2]|0)==(c[d>>2]|0);i=e;return a|0}function Mg(a,b,d){a=a|0;b=b|0;d=d|0;if((c[b+4>>2]|0)!=(a|0)){a=0;return a|0}a=(c[b>>2]|0)==(d|0);return a|0}function Ng(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;d=Vb(e|0)|0;e=Mp(d|0)|0;if(e>>>0>4294967279>>>0){Tg(0)}if(e>>>0<11>>>0){a[b]=e<<1;b=b+1|0;Np(b|0,d|0,e)|0;d=b+e|0;a[d]=0;return}else{g=e+16&-16;f=vp(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=e;b=f;Np(b|0,d|0,e)|0;d=b+e|0;a[d]=0;return}}function Og(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;j=f;h=i;i=i+12|0;i=i+7&-8;l=e|0;k=c[l>>2]|0;do{if((k|0)!=0){m=d[j]|0;if((m&1|0)==0){m=m>>>1}else{m=c[f+4>>2]|0}if((m|0)!=0){dh(f,15672,2)|0;k=c[l>>2]|0}e=c[e+4>>2]|0;Qc[c[(c[e>>2]|0)+24>>2]&31](h,e,k);e=h;l=a[e]|0;if((l&1)==0){k=h+1|0}else{k=c[h+8>>2]|0}l=l&255;if((l&1|0)==0){l=l>>>1}else{l=c[h+4>>2]|0}y=0,ta(44,f|0,k|0,l|0)|0;if(!y){if((a[e]&1)==0){break}xp(c[h+8>>2]|0);break}else{y=0}f=Mb(-1,-1)|0;if((a[e]&1)==0){db(f|0)}xp(c[h+8>>2]|0);db(f|0)}}while(0);m=b;c[m>>2]=c[j>>2];c[m+4>>2]=c[j+4>>2];c[m+8>>2]=c[j+8>>2];Pp(j|0,0,12)|0;i=g;return}function Pg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;h=i;i=i+32|0;g=d;d=i;i=i+8|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];g=h|0;f=h+16|0;j=Mp(e|0)|0;if(j>>>0>4294967279>>>0){Tg(0)}if(j>>>0<11>>>0){a[f]=j<<1;k=f+1|0}else{l=j+16&-16;k=vp(l)|0;c[f+8>>2]=k;c[f>>2]=l|1;c[f+4>>2]=j}Np(k|0,e|0,j)|0;a[k+j|0]=0;y=0;Ha(12,g|0,d|0,f|0);do{if(!y){y=0;qa(56,b|0,g|0);if(y){y=0;b=Mb(-1,-1)|0;if((a[g]&1)==0){break}xp(c[g+8>>2]|0);break}if((a[g]&1)!=0){xp(c[g+8>>2]|0)}if((a[f]&1)==0){l=b|0;c[l>>2]=21776;l=b+8|0;k=d;e=k|0;e=c[e>>2]|0;k=k+4|0;k=c[k>>2]|0;d=l|0;c[d>>2]=e;l=l+4|0;c[l>>2]=k;i=h;return}xp(c[f+8>>2]|0);l=b|0;c[l>>2]=21776;l=b+8|0;k=d;e=k|0;e=c[e>>2]|0;k=k+4|0;k=c[k>>2]|0;d=l|0;c[d>>2]=e;l=l+4|0;c[l>>2]=k;i=h;return}else{y=0;b=Mb(-1,-1)|0;}}while(0);if((a[f]&1)==0){l=b;db(l|0)}xp(c[f+8>>2]|0);l=b;db(l|0)}function Qg(a){a=a|0;Fg(a|0);xp(a);return}function Rg(a){a=a|0;Fg(a|0);return}function Sg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;f;if((c[a>>2]|0)==1){do{ab(30312,30288)|0;}while((c[a>>2]|0)==1)}if((c[a>>2]|0)!=0){e;return}c[a>>2]=1;y=0,ra(66,30288)|0;do{if(!y){y=0;pa(d|0,b|0);if(y){y=0;break}y=0,ra(16,30288)|0;if(y){y=0;break}c[a>>2]=-1;y=0,ra(66,30288)|0;if(y){y=0;break}y=0,ra(142,30312)|0;if(y){y=0;break}return}else{y=0}}while(0);f=Mb(-1,-1,0)|0;yb(f|0)|0;y=0,ra(16,30288)|0;do{if(!y){c[a>>2]=0;y=0,ra(66,30288)|0;if(y){y=0;break}y=0,ra(142,30312)|0;if(y){y=0;break}y=0;Ia(2);if(y){y=0;break}}else{y=0}}while(0);e=Mb(-1,-1)|0;y=0;Ia(6);if(!y){db(e|0)}else{y=0;f=Mb(-1,-1,0)|0;nd(f)}}function Tg(a){a=a|0;var b=0;a=lc(8)|0;y=0;qa(54,a|0,11856);if(!y){c[a>>2]=19664;Hb(a|0,25640,44)}else{y=0;b=Mb(-1,-1)|0;kb(a|0);db(b|0)}}function Ug(a){a=a|0;var b=0;a=lc(8)|0;y=0;qa(54,a|0,11856);if(!y){c[a>>2]=19632;Hb(a|0,25624,8)}else{y=0;b=Mb(-1,-1)|0;kb(a|0);db(b|0)}}function Vg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=d;if((a[e]&1)==0){d=b;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];c[d+8>>2]=c[e+8>>2];return}e=c[d+8>>2]|0;d=c[d+4>>2]|0;if(d>>>0>4294967279>>>0){Tg(0)}if(d>>>0<11>>>0){a[b]=d<<1;b=b+1|0}else{g=d+16&-16;f=vp(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=d;b=f}Np(b|0,e|0,d)|0;a[b+d|0]=0;return}function Wg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(e>>>0>4294967279>>>0){Tg(0)}if(e>>>0<11>>>0){a[b]=e<<1;b=b+1|0;Np(b|0,d|0,e)|0;d=b+e|0;a[d]=0;return}else{g=e+16&-16;f=vp(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=e;b=f;Np(b|0,d|0,e)|0;d=b+e|0;a[d]=0;return}}function Xg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(d>>>0>4294967279>>>0){Tg(0)}if(d>>>0<11>>>0){a[b]=d<<1;b=b+1|0}else{g=d+16&-16;f=vp(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=d;b=f}Pp(b|0,e|0,d|0)|0;a[b+d|0]=0;return}function Yg(b){b=b|0;if((a[b]&1)==0){return}xp(c[b+8>>2]|0);return}function Zg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;if((b|0)==(d|0)){return b|0}f=a[d]|0;if((f&1)==0){e=d+1|0}else{e=c[d+8>>2]|0}f=f&255;if((f&1|0)==0){d=f>>>1}else{d=c[d+4>>2]|0}h=b;g=b;i=a[g]|0;if((i&1)==0){f=10}else{i=c[b>>2]|0;f=(i&-2)-1|0;i=i&255}if(f>>>0<d>>>0){g=i&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+4>>2]|0}eh(b,f,d-f|0,g,0,g,d,e);return b|0}if((i&1)==0){f=h+1|0}else{f=c[b+8>>2]|0}Op(f|0,e|0,d|0)|0;a[f+d|0]=0;if((a[g]&1)==0){a[g]=d<<1;return b|0}else{c[b+4>>2]=d;return b|0}return 0}function _g(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=Mp(d|0)|0;h=b;g=b;i=a[g]|0;if((i&1)==0){f=10}else{i=c[b>>2]|0;f=(i&-2)-1|0;i=i&255}if(f>>>0<e>>>0){g=i&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+4>>2]|0}eh(b,f,e-f|0,g,0,g,e,d);return b|0}if((i&1)==0){f=h+1|0}else{f=c[b+8>>2]|0}Op(f|0,d|0,e|0)|0;a[f+e|0]=0;if((a[g]&1)==0){a[g]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function $g(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b;g=a[f]|0;h=g&255;if((h&1|0)==0){h=h>>>1}else{h=c[b+4>>2]|0}if(h>>>0<d>>>0){ah(b,d-h|0,e)|0;return}if((g&1)==0){a[b+1+d|0]=0;a[f]=d<<1;return}else{a[(c[b+8>>2]|0)+d|0]=0;c[b+4>>2]=d;return}}function ah(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if((d|0)==0){return b|0}f=b;i=a[f]|0;if((i&1)==0){h=10}else{i=c[b>>2]|0;h=(i&-2)-1|0;i=i&255}g=i&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+4>>2]|0}if((h-g|0)>>>0<d>>>0){fh(b,h,d-h+g|0,g,g,0,0);i=a[f]|0}if((i&1)==0){h=b+1|0}else{h=c[b+8>>2]|0}Pp(h+g|0,e|0,d|0)|0;d=g+d|0;if((a[f]&1)==0){a[f]=d<<1}else{c[b+4>>2]=d}a[h+d|0]=0;return b|0}function bh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;if(d>>>0>4294967279>>>0){Tg(0)}h=b;e=b;g=a[e]|0;if((g&1)==0){i=10}else{g=c[b>>2]|0;i=(g&-2)-1|0;g=g&255}f=g&255;if((f&1|0)==0){f=f>>>1}else{f=c[b+4>>2]|0}d=f>>>0>d>>>0?f:d;if(d>>>0<11>>>0){d=11}else{d=d+16&-16}j=d-1|0;if((j|0)==(i|0)){return}if((j|0)==10){h=h+1|0;i=c[b+8>>2]|0;k=1;j=0}else{do{if(j>>>0>i>>>0){k=vp(d)|0}else{k=(y=0,ra(130,d|0)|0);if(!y){break}else{y=0}k=Mb(-1,-1,0)|0;yb(k|0)|0;Qa();return}}while(0);j=g&1;if(j<<24>>24==0){i=h+1|0}else{i=c[b+8>>2]|0}h=k;k=j<<24>>24!=0;j=1}g=g&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+4>>2]|0}Np(h|0,i|0,g+1|0)|0;if(k){xp(i)}if(j){c[b>>2]=d|1;c[b+4>>2]=f;c[b+8>>2]=h;return}else{a[e]=f<<1;return}}function ch(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=b;g=a[e]|0;if((g&1)==0){f=(g&255)>>>1;h=10}else{f=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}if((f|0)==(h|0)){fh(b,h,1,h,h,0,0);g=a[e]|0}if((g&1)==0){a[e]=(f<<1)+2;g=b+1|0;h=f+1|0;f=g+f|0;a[f]=d;h=g+h|0;a[h]=0;return}else{g=c[b+8>>2]|0;h=f+1|0;c[b+4>>2]=h;f=g+f|0;a[f]=d;h=g+h|0;a[h]=0;return}}function dh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b;h=a[f]|0;if((h&1)==0){g=10}else{h=c[b>>2]|0;g=(h&-2)-1|0;h=h&255}i=h&255;if((i&1|0)==0){i=i>>>1}else{i=c[b+4>>2]|0}if((g-i|0)>>>0<e>>>0){eh(b,g,e-g+i|0,i,i,0,e,d);return b|0}if((e|0)==0){return b|0}if((h&1)==0){g=b+1|0}else{g=c[b+8>>2]|0}Np(g+i|0,d|0,e)|0;e=i+e|0;if((a[f]&1)==0){a[f]=e<<1}else{c[b+4>>2]=e}a[g+e|0]=0;return b|0}function eh(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0;if((-18-d|0)>>>0<e>>>0){Tg(0)}if((a[b]&1)==0){k=b+1|0}else{k=c[b+8>>2]|0}do{if(d>>>0<2147483623>>>0){l=e+d|0;e=d<<1;e=l>>>0<e>>>0?e:l;if(e>>>0<11>>>0){l=11;break}l=e+16&-16}else{l=-17}}while(0);e=vp(l)|0;if((g|0)!=0){Np(e|0,k|0,g)|0}if((i|0)!=0){Np(e+g|0,j|0,i)|0}f=f-h|0;if((f|0)!=(g|0)){Np(e+(i+g)|0,k+(h+g)|0,f-g|0)|0}if((d|0)==10){j=b+8|0;c[j>>2]=e;j=l|1;l=b|0;c[l>>2]=j;l=f+i|0;j=b+4|0;c[j>>2]=l;l=e+l|0;a[l]=0;return}xp(k);j=b+8|0;c[j>>2]=e;j=l|1;l=b|0;c[l>>2]=j;l=f+i|0;j=b+4|0;c[j>>2]=l;l=e+l|0;a[l]=0;return}function fh(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0;if((-17-d|0)>>>0<e>>>0){Tg(0)}if((a[b]&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if(d>>>0<2147483623>>>0){k=e+d|0;e=d<<1;e=k>>>0<e>>>0?e:k;if(e>>>0<11>>>0){k=11;break}k=e+16&-16}else{k=-17}}while(0);e=vp(k)|0;if((g|0)!=0){Np(e|0,j|0,g)|0}f=f-h|0;if((f|0)!=(g|0)){Np(e+(i+g)|0,j+(h+g)|0,f-g|0)|0}if((d|0)==10){f=b+8|0;c[f>>2]=e;e=k|1;k=b|0;c[k>>2]=e;return}xp(j);f=b+8|0;c[f>>2]=e;e=k|1;k=b|0;c[k>>2]=e;return}function gh(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;h=b;j=a[h]|0;i=j&255;if((i&1|0)==0){i=i>>>1}else{i=c[b+4>>2]|0}if(i>>>0<d>>>0){Ug(0);return 0}l=i-d|0;e=l>>>0<e>>>0?l:e;if((j&1)==0){m=10}else{j=c[b>>2]|0;m=(j&-2)-1|0;j=j&255}if((e-i+m|0)>>>0<g>>>0){eh(b,m,i+g-e-m|0,i,d,e,g,f);return b|0}if((j&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}do{if((e|0)==(g|0)){m=g;e=g;k=22}else{m=l-e|0;if((l|0)==(e|0)){m=g;e=l;k=22;break}l=j+d|0;if(e>>>0>g>>>0){Op(l|0,f|0,g|0)|0;Op(j+(g+d)|0,j+(e+d)|0,m|0)|0;break}do{if(l>>>0<f>>>0){if((j+i|0)>>>0<=f>>>0){break}k=e+d|0;if((j+k|0)>>>0>f>>>0){Op(l|0,f|0,e|0)|0;d=k;f=f+g|0;g=g-e|0;e=0;break}else{f=f+(g-e)|0;break}}}while(0);Op(j+(d+g)|0,j+(d+e)|0,m|0)|0;m=g;k=22}}while(0);if((k|0)==22){Op(j+d|0,f|0,m|0)|0;g=m}i=g-e+i|0;if((a[h]&1)==0){a[h]=i<<1}else{c[b+4>>2]=i}a[j+i|0]=0;return b|0}function hh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(e>>>0>1073741807>>>0){Tg(0)}if(e>>>0<2>>>0){a[b]=e<<1;b=b+4|0;To(b,d,e)|0;d=b+(e<<2)|0;c[d>>2]=0;return}else{g=e+4&-4;f=vp(g<<2)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=e;b=f;To(b,d,e)|0;d=b+(e<<2)|0;c[d>>2]=0;return}}function ih(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(d>>>0>1073741807>>>0){Tg(0)}if(d>>>0<2>>>0){a[b]=d<<1;b=b+4|0;Vo(b,e,d)|0;e=b+(d<<2)|0;c[e>>2]=0;return}else{g=d+4&-4;f=vp(g<<2)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=d;b=f;Vo(b,e,d)|0;e=b+(d<<2)|0;c[e>>2]=0;return}}function jh(b){b=b|0;if((a[b]&1)==0){return}xp(c[b+8>>2]|0);return}function kh(a,b){a=a|0;b=b|0;return lh(a,b,So(b)|0)|0}function lh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;g=b;h=a[g]|0;if((h&1)==0){f=1}else{h=c[b>>2]|0;f=(h&-2)-1|0;h=h&255}if(f>>>0<e>>>0){g=h&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+4>>2]|0}oh(b,f,e-f|0,g,0,g,e,d);return b|0}if((h&1)==0){f=b+4|0}else{f=c[b+8>>2]|0}Uo(f,d,e)|0;c[f+(e<<2)>>2]=0;if((a[g]&1)==0){a[g]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function mh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;if(d>>>0>1073741807>>>0){Tg(0)}e=b;g=a[e]|0;if((g&1)==0){h=1}else{g=c[b>>2]|0;h=(g&-2)-1|0;g=g&255}f=g&255;if((f&1|0)==0){f=f>>>1}else{f=c[b+4>>2]|0}d=f>>>0>d>>>0?f:d;if(d>>>0<2>>>0){d=2}else{d=d+4&-4}j=d-1|0;if((j|0)==(h|0)){return}if((j|0)==1){k=b+4|0;h=c[b+8>>2]|0;i=1;j=0}else{i=d<<2;do{if(j>>>0>h>>>0){k=vp(i)|0}else{k=(y=0,ra(130,i|0)|0);if(!y){break}else{y=0}k=Mb(-1,-1,0)|0;yb(k|0)|0;Qa();return}}while(0);i=g&1;if(i<<24>>24==0){h=b+4|0}else{h=c[b+8>>2]|0}i=i<<24>>24!=0;j=1}g=g&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+4>>2]|0}To(k,h,g+1|0)|0;if(i){xp(h)}if(j){c[b>>2]=d|1;c[b+4>>2]=f;c[b+8>>2]=k;return}else{a[e]=f<<1;return}}function nh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=b;g=a[e]|0;if((g&1)==0){f=(g&255)>>>1;h=1}else{f=c[b+4>>2]|0;h=(c[b>>2]&-2)-1|0}if((f|0)==(h|0)){ph(b,h,1,h,h,0,0);g=a[e]|0}if((g&1)==0){a[e]=(f<<1)+2;g=b+4|0;h=f+1|0;f=g+(f<<2)|0;c[f>>2]=d;h=g+(h<<2)|0;c[h>>2]=0;return}else{g=c[b+8>>2]|0;h=f+1|0;c[b+4>>2]=h;f=g+(f<<2)|0;c[f>>2]=d;h=g+(h<<2)|0;c[h>>2]=0;return}}function oh(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0,l=0;if((1073741806-d|0)>>>0<e>>>0){Tg(0)}if((a[b]&1)==0){k=b+4|0}else{k=c[b+8>>2]|0}do{if(d>>>0<536870887>>>0){l=e+d|0;e=d<<1;e=l>>>0<e>>>0?e:l;if(e>>>0<2>>>0){l=2;break}l=e+4&-4}else{l=1073741807}}while(0);e=vp(l<<2)|0;if((g|0)!=0){To(e,k,g)|0}if((i|0)!=0){To(e+(g<<2)|0,j,i)|0}f=f-h|0;if((f|0)!=(g|0)){To(e+(i+g<<2)|0,k+(h+g<<2)|0,f-g|0)|0}if((d|0)==1){j=b+8|0;c[j>>2]=e;j=l|1;l=b|0;c[l>>2]=j;l=f+i|0;j=b+4|0;c[j>>2]=l;l=e+(l<<2)|0;c[l>>2]=0;return}xp(k);j=b+8|0;c[j>>2]=e;j=l|1;l=b|0;c[l>>2]=j;l=f+i|0;j=b+4|0;c[j>>2]=l;l=e+(l<<2)|0;c[l>>2]=0;return}function ph(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0;if((1073741807-d|0)>>>0<e>>>0){Tg(0)}if((a[b]&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}do{if(d>>>0<536870887>>>0){k=e+d|0;e=d<<1;e=k>>>0<e>>>0?e:k;if(e>>>0<2>>>0){k=2;break}k=e+4&-4}else{k=1073741807}}while(0);e=vp(k<<2)|0;if((g|0)!=0){To(e,j,g)|0}f=f-h|0;if((f|0)!=(g|0)){To(e+(i+g<<2)|0,j+(h+g<<2)|0,f-g|0)|0}if((d|0)==1){f=b+8|0;c[f>>2]=e;e=k|1;k=b|0;c[k>>2]=e;return}xp(j);f=b+8|0;c[f>>2]=e;e=k|1;k=b|0;c[k>>2]=e;return}function qh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;f=i;i=i+8|0;e=f|0;g=(c[b+24>>2]|0)==0;if(g){c[b+16>>2]=d|1}else{c[b+16>>2]=d}if(((g&1|d)&c[b+20>>2]|0)==0){i=f;return}d=lc(16)|0;do{if((a[31432]|0)==0){if((xb(31432)|0)==0){break}c[7332]=21208;jb(80,29328,v|0)|0}}while(0);b=Vp(29328,0,32)|0;c[e>>2]=b|1;c[e+4>>2]=L;y=0;Ha(18,d|0,e|0,16088);if(!y){c[d>>2]=20344;Hb(d|0,26184,38)}else{y=0;b=Mb(-1,-1)|0;kb(d|0);db(b|0)}}function rh(a){a=a|0;var b=0,d=0,e=0;c[a>>2]=20320;e=c[a+40>>2]|0;b=a+32|0;d=a+36|0;a:do{if((e|0)!=0){while(1){e=e-1|0;y=0;Ha(c[(c[b>>2]|0)+(e<<2)>>2]|0,0,a|0,c[(c[d>>2]|0)+(e<<2)>>2]|0);if(y){y=0;break}if((e|0)==0){break a}}e=Mb(-1,-1,0)|0;nd(e)}}while(0);Dm(a+28|0);rp(c[b>>2]|0);rp(c[d>>2]|0);rp(c[a+48>>2]|0);rp(c[a+60>>2]|0);return}function sh(a,b){a=a|0;b=b|0;Cm(a,b+28|0);return}function th(a,b){a=a|0;b=b|0;c[a+24>>2]=b;c[a+16>>2]=(b|0)==0;c[a+20>>2]=0;c[a+4>>2]=4098;c[a+12>>2]=0;c[a+8>>2]=6;Pp(a+32|0,0,40)|0;Bm(a+28|0);return}function uh(a){a=a|0;c[a>>2]=21512;Dm(a+4|0);xp(a);return}function vh(a){a=a|0;c[a>>2]=21512;Dm(a+4|0);return}function wh(a,b){a=a|0;b=b|0;return}function xh(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function yh(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function zh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;e=i;f=d;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function Ah(a){a=a|0;return 0}function Bh(a){a=a|0;return 0}function Ch(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=b;if((e|0)<=0){j=0;return j|0}g=b+12|0;h=b+16|0;i=0;while(1){j=c[g>>2]|0;if(j>>>0<(c[h>>2]|0)>>>0){c[g>>2]=j+1;j=a[j]|0}else{j=Ac[c[(c[f>>2]|0)+40>>2]&255](b)|0;if((j|0)==-1){e=8;break}j=j&255}a[d]=j;i=i+1|0;if((i|0)<(e|0)){d=d+1|0}else{e=8;break}}if((e|0)==8){return i|0}return 0}function Dh(a){a=a|0;return-1|0}function Eh(a){a=a|0;var b=0;if((Ac[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){a=-1;return a|0}b=a+12|0;a=c[b>>2]|0;c[b>>2]=a+1;a=d[a]|0;return a|0}function Fh(a,b){a=a|0;b=b|0;return-1|0}function Gh(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;i=b;if((f|0)<=0){k=0;return k|0}g=b+24|0;h=b+28|0;j=0;while(1){k=c[g>>2]|0;if(k>>>0<(c[h>>2]|0)>>>0){l=a[e]|0;c[g>>2]=k+1;a[k]=l}else{if((Mc[c[(c[i>>2]|0)+52>>2]&63](b,d[e]|0)|0)==-1){f=7;break}}j=j+1|0;if((j|0)<(f|0)){e=e+1|0}else{f=7;break}}if((f|0)==7){return j|0}return 0}function Hh(a,b){a=a|0;b=b|0;return-1|0}function Ih(a){a=a|0;c[a>>2]=21440;Dm(a+4|0);xp(a);return}function Jh(a){a=a|0;c[a>>2]=21440;Dm(a+4|0);return}function Kh(a,b){a=a|0;b=b|0;return}function Lh(a,b,c){a=a|0;b=b|0;c=c|0;return a|0}function Mh(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;g=a;c[g>>2]=0;c[g+4>>2]=0;g=a+8|0;c[g>>2]=-1;c[g+4>>2]=-1;return}function Nh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;e=i;f=d;b=i;i=i+16|0;c[b>>2]=c[f>>2];c[b+4>>2]=c[f+4>>2];c[b+8>>2]=c[f+8>>2];c[b+12>>2]=c[f+12>>2];b=a;c[b>>2]=0;c[b+4>>2]=0;b=a+8|0;c[b>>2]=-1;c[b+4>>2]=-1;i=e;return}function Oh(a){a=a|0;return 0}function Ph(a){a=a|0;return 0}function Qh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=a;if((d|0)<=0){i=0;return i|0}f=a+12|0;g=a+16|0;h=0;while(1){i=c[f>>2]|0;if(i>>>0<(c[g>>2]|0)>>>0){c[f>>2]=i+4;i=c[i>>2]|0}else{i=Ac[c[(c[e>>2]|0)+40>>2]&255](a)|0;if((i|0)==-1){d=7;break}}c[b>>2]=i;h=h+1|0;if((h|0)<(d|0)){b=b+4|0}else{d=7;break}}if((d|0)==7){return h|0}return 0}function Rh(a){a=a|0;return-1|0}function Sh(a){a=a|0;var b=0;if((Ac[c[(c[a>>2]|0)+36>>2]&255](a)|0)==-1){a=-1;return a|0}b=a+12|0;a=c[b>>2]|0;c[b>>2]=a+4;a=c[a>>2]|0;return a|0}function Th(a,b){a=a|0;b=b|0;return-1|0}function Uh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;g=a;if((d|0)<=0){i=0;return i|0}e=a+24|0;f=a+28|0;h=0;while(1){i=c[e>>2]|0;if(i>>>0<(c[f>>2]|0)>>>0){j=c[b>>2]|0;c[e>>2]=i+4;c[i>>2]=j}else{if((Mc[c[(c[g>>2]|0)+52>>2]&63](a,c[b>>2]|0)|0)==-1){d=7;break}}h=h+1|0;if((h|0)<(d|0)){b=b+4|0}else{d=7;break}}if((d|0)==7){return h|0}return 0}function Vh(a,b){a=a|0;b=b|0;return-1|0}function Wh(a){a=a|0;rh(a+8|0);xp(a);return}function Xh(a){a=a|0;rh(a+8|0);return}function Yh(a){a=a|0;var b=0;b=a;a=c[(c[a>>2]|0)-12>>2]|0;rh(b+(a+8)|0);xp(b+a|0);return}function Zh(a){a=a|0;rh(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function _h(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+8|0;d=e|0;f=b;k=c[(c[f>>2]|0)-12>>2]|0;g=b;if((c[g+(k+24)>>2]|0)==0){i=e;return b|0}j=d|0;a[j]=0;c[d+4>>2]=b;do{if((c[g+(k+16)>>2]|0)==0){k=c[g+(k+72)>>2]|0;do{if((k|0)==0){h=5}else{y=0,ra(80,k|0)|0;if(!y){h=5;break}else{y=0}j=Mb(-1,-1,0)|0;}}while(0);if((h|0)==5){a[j]=1;h=c[g+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;h=(y=0,ra(c[(c[h>>2]|0)+24>>2]|0,h|0)|0);if(!y){if((h|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;y=0;qa(90,g+k|0,c[g+(k+16)>>2]|1|0);if(!y){break}else{y=0}}else{y=0}j=Mb(-1,-1,0)|0;ji(d)}yb(j|0)|0;k=c[(c[f>>2]|0)-12>>2]|0;j=g+(k+16)|0;c[j>>2]=c[j>>2]|1;if((c[g+(k+20)>>2]&1|0)==0){Qa();i=e;return b|0}y=0;Ia(2);if(!y){return 0}else{y=0}f=Mb(-1,-1)|0;y=0;Ia(6);if(!y){db(f|0)}else{y=0;k=Mb(-1,-1,0)|0;nd(k);return 0}}}while(0);ji(d);i=e;return b|0}function $h(a){a=a|0;var b=0;b=a+16|0;c[b>>2]=c[b>>2]|1;if((c[a+20>>2]&1|0)==0){return}else{bb()}}function ai(a){a=a|0;rh(a+8|0);xp(a);return}function bi(a){a=a|0;rh(a+8|0);return}function ci(a){a=a|0;var b=0;b=a;a=c[(c[a>>2]|0)-12>>2]|0;rh(b+(a+8)|0);xp(b+a|0);return}function di(a){a=a|0;rh(a+((c[(c[a>>2]|0)-12>>2]|0)+8)|0);return}function ei(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+8|0;d=e|0;f=b;k=c[(c[f>>2]|0)-12>>2]|0;g=b;if((c[g+(k+24)>>2]|0)==0){i=e;return b|0}j=d|0;a[j]=0;c[d+4>>2]=b;do{if((c[g+(k+16)>>2]|0)==0){k=c[g+(k+72)>>2]|0;do{if((k|0)==0){h=5}else{y=0,ra(34,k|0)|0;if(!y){h=5;break}else{y=0}j=Mb(-1,-1,0)|0;}}while(0);if((h|0)==5){a[j]=1;h=c[g+((c[(c[f>>2]|0)-12>>2]|0)+24)>>2]|0;h=(y=0,ra(c[(c[h>>2]|0)+24>>2]|0,h|0)|0);if(!y){if((h|0)!=-1){break}k=c[(c[f>>2]|0)-12>>2]|0;y=0;qa(90,g+k|0,c[g+(k+16)>>2]|1|0);if(!y){break}else{y=0}}else{y=0}j=Mb(-1,-1,0)|0;qi(d)}yb(j|0)|0;k=c[(c[f>>2]|0)-12>>2]|0;j=g+(k+16)|0;c[j>>2]=c[j>>2]|1;if((c[g+(k+20)>>2]&1|0)==0){Qa();i=e;return b|0}y=0;Ia(2);if(!y){return 0}else{y=0}f=Mb(-1,-1)|0;y=0;Ia(6);if(!y){db(f|0)}else{y=0;k=Mb(-1,-1,0)|0;nd(k);return 0}}}while(0);qi(d);i=e;return b|0}function fi(a){a=a|0;rh(a+4|0);xp(a);return}function gi(a){a=a|0;rh(a+4|0);return}function hi(a){a=a|0;var b=0;b=a;a=c[(c[a>>2]|0)-12>>2]|0;rh(b+(a+4)|0);xp(b+a|0);return}function ii(a){a=a|0;rh(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function ji(a){a=a|0;var b=0,d=0;a=a+4|0;b=c[a>>2]|0;d=c[(c[b>>2]|0)-12>>2]|0;if((c[b+(d+24)>>2]|0)==0){return}if((c[b+(d+16)>>2]|0)!=0){return}if((c[b+(d+4)>>2]&8192|0)==0){return}if(Bb()|0){return}b=c[a>>2]|0;b=c[b+((c[(c[b>>2]|0)-12>>2]|0)+24)>>2]|0;b=(y=0,ra(c[(c[b>>2]|0)+24>>2]|0,b|0)|0);do{if(!y){if((b|0)!=-1){return}b=c[a>>2]|0;d=c[(c[b>>2]|0)-12>>2]|0;y=0;qa(90,b+d|0,c[b+(d+16)>>2]|1|0);if(y){y=0;break}return}else{y=0}}while(0);d=Mb(-1,-1,0)|0;yb(d|0)|0;y=0;Ia(6);if(!y){return}else{y=0;d=Mb(-1,-1,0)|0;nd(d)}}function ki(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=i;i=i+40|0;k=f|0;m=f+8|0;e=f+16|0;p=f+24|0;l=f+32|0;n=e|0;a[n]=0;c[e+4>>2]=b;g=b;o=c[(c[g>>2]|0)-12>>2]|0;h=b;do{if((c[h+(o+16)>>2]|0)==0){o=c[h+(o+72)>>2]|0;do{if((o|0)==0){j=4}else{y=0,ra(80,o|0)|0;if(!y){j=4;break}else{y=0}k=Mb(-1,-1,0)|0;}}while(0);if((j|0)==4){a[n]=1;Cm(p,h+((c[(c[g>>2]|0)-12>>2]|0)+28)|0);n=(y=0,Da(54,p|0,30512)|0);if(!y){o=n;Dm(p);s=c[(c[g>>2]|0)-12>>2]|0;q=c[h+(s+24)>>2]|0;p=h+s|0;r=h+(s+76)|0;u=c[r>>2]|0;t=u&255;a:do{if((u|0)==-1){Cm(m,h+(s+28)|0);s=(y=0,Da(54,m|0,30864)|0);do{if(!y){t=(y=0,Da(c[(c[s>>2]|0)+28>>2]|0,s|0,32)|0);if(y){y=0;break}Dm(m);c[r>>2]=t<<24>>24;j=10;break a}else{y=0}}while(0);k=Mb(-1,-1,0)|0;Dm(m)}else{j=10}}while(0);if((j|0)==10){u=c[(c[n>>2]|0)+16>>2]|0;c[k>>2]=q;y=0;xa(u|0,l|0,o|0,k|0,p|0,t|0,d|0);if(!y){if((c[l>>2]|0)!=0){break}u=c[(c[g>>2]|0)-12>>2]|0;y=0;qa(90,h+u|0,c[h+(u+16)>>2]|5|0);if(!y){break}else{y=0}}else{y=0}k=Mb(-1,-1,0)|0;}}else{y=0;k=Mb(-1,-1,0)|0;Dm(p)}ji(e)}yb(k|0)|0;u=c[(c[g>>2]|0)-12>>2]|0;t=h+(u+16)|0;c[t>>2]=c[t>>2]|1;if((c[h+(u+20)>>2]&1|0)==0){Qa();i=f;return b|0}y=0;Ia(2);if(!y){return 0}else{y=0}g=Mb(-1,-1)|0;y=0;Ia(6);if(!y){db(g|0)}else{y=0;u=Mb(-1,-1,0)|0;nd(u);return 0}}}while(0);ji(e);i=f;return b|0}function li(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+8|0;e=f|0;k=e|0;a[k]=0;c[e+4>>2]=b;h=b;l=c[(c[h>>2]|0)-12>>2]|0;g=b;do{if((c[g+(l+16)>>2]|0)==0){l=c[g+(l+72)>>2]|0;do{if((l|0)==0){j=4}else{y=0,ra(80,l|0)|0;if(!y){j=4;break}else{y=0}d=Mb(-1,-1,0)|0;}}while(0);if((j|0)==4){a[k]=1;l=c[g+((c[(c[h>>2]|0)-12>>2]|0)+24)>>2]|0;k=l;do{if((l|0)==0){j=9}else{n=l+24|0;m=c[n>>2]|0;if((m|0)==(c[l+28>>2]|0)){d=(y=0,Da(c[(c[l>>2]|0)+52>>2]|0,k|0,d&255|0)|0);if(y){y=0;break}}else{c[n>>2]=m+1;a[m]=d;d=d&255}k=(d|0)==-1?0:k;j=9}}while(0);if((j|0)==9){if((k|0)!=0){break}n=c[(c[h>>2]|0)-12>>2]|0;y=0;qa(90,g+n|0,c[g+(n+16)>>2]|1|0);if(!y){break}else{y=0}}d=Mb(-1,-1,0)|0;ji(e)}yb(d|0)|0;n=c[(c[h>>2]|0)-12>>2]|0;m=g+(n+16)|0;c[m>>2]=c[m>>2]|1;if((c[g+(n+20)>>2]&1|0)==0){Qa();i=f;return b|0}y=0;Ia(2);if(!y){return 0}else{y=0}g=Mb(-1,-1)|0;y=0;Ia(6);if(!y){db(g|0)}else{y=0;n=Mb(-1,-1,0)|0;nd(n);return 0}}}while(0);ji(e);i=f;return b|0}function mi(a){a=a|0;rh(a+4|0);xp(a);return}function ni(a){a=a|0;rh(a+4|0);return}function oi(a){a=a|0;var b=0;b=a;a=c[(c[a>>2]|0)-12>>2]|0;rh(b+(a+4)|0);xp(b+a|0);return}function pi(a){a=a|0;rh(a+((c[(c[a>>2]|0)-12>>2]|0)+4)|0);return}function qi(a){a=a|0;var b=0,d=0;a=a+4|0;b=c[a>>2]|0;d=c[(c[b>>2]|0)-12>>2]|0;if((c[b+(d+24)>>2]|0)==0){return}if((c[b+(d+16)>>2]|0)!=0){return}if((c[b+(d+4)>>2]&8192|0)==0){return}if(Bb()|0){return}b=c[a>>2]|0;b=c[b+((c[(c[b>>2]|0)-12>>2]|0)+24)>>2]|0;b=(y=0,ra(c[(c[b>>2]|0)+24>>2]|0,b|0)|0);do{if(!y){if((b|0)!=-1){return}b=c[a>>2]|0;d=c[(c[b>>2]|0)-12>>2]|0;y=0;qa(90,b+d|0,c[b+(d+16)>>2]|1|0);if(y){y=0;break}return}else{y=0}}while(0);d=Mb(-1,-1,0)|0;yb(d|0)|0;y=0;Ia(6);if(!y){return}else{y=0;d=Mb(-1,-1,0)|0;nd(d)}}function ri(a){a=a|0;return 17224}function si(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)==1){Wg(a,17904,35);return}else{Ng(a,b|0,c);return}}function ti(a){a=a|0;Jg(a|0);return}function ui(a){a=a|0;Rg(a|0);xp(a);return}function vi(a){a=a|0;Rg(a|0);return}function wi(a){a=a|0;rh(a);xp(a);return}function xi(a){a=a|0;Jg(a|0);xp(a);return}function yi(a){a=a|0;vg(a|0);xp(a);return}function zi(a){a=a|0;vg(a|0);return}function Ai(a){a=a|0;vg(a|0);return}function Bi(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0;a:do{if((e|0)!=(f|0)){while(1){if((c|0)==(d|0)){d=-1;f=7;break}g=a[c]|0;b=a[e]|0;if(g<<24>>24<b<<24>>24){d=-1;f=7;break}if(b<<24>>24<g<<24>>24){d=1;f=7;break}c=c+1|0;e=e+1|0;if((e|0)==(f|0)){break a}}if((f|0)==7){return d|0}}}while(0);g=(c|0)!=(d|0)|0;return g|0}function Ci(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;d=e;g=f-d|0;if(g>>>0>4294967279>>>0){Tg(b)}if(g>>>0<11>>>0){a[b]=g<<1;b=b+1|0}else{i=g+16&-16;h=vp(i)|0;c[b+8>>2]=h;c[b>>2]=i|1;c[b+4>>2]=g;b=h}if((e|0)==(f|0)){i=b;a[i]=0;return}d=f+(-d|0)|0;g=b;while(1){a[g]=a[e]|0;e=e+1|0;if((e|0)==(f|0)){break}else{g=g+1|0}}i=b+d|0;a[i]=0;return}function Di(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)==(d|0)){b=0;return b|0}else{b=0}do{b=(a[c]|0)+(b<<4)|0;e=b&-268435456;b=(e>>>24|e)^b;c=c+1|0;}while((c|0)!=(d|0));return b|0}function Ei(a){a=a|0;vg(a|0);xp(a);return}function Fi(a){a=a|0;vg(a|0);return}function Gi(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a:do{if((e|0)==(f|0)){g=6}else{while(1){if((b|0)==(d|0)){d=-1;break a}h=c[b>>2]|0;a=c[e>>2]|0;if((h|0)<(a|0)){d=-1;break a}if((a|0)<(h|0)){d=1;break a}b=b+4|0;e=e+4|0;if((e|0)==(f|0)){g=6;break}}}}while(0);if((g|0)==6){d=(b|0)!=(d|0)|0}return d|0}function Hi(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0;d=e;g=f-d|0;h=g>>2;if(h>>>0>1073741807>>>0){Tg(b)}if(h>>>0<2>>>0){a[b]=g>>>1;b=b+4|0}else{i=h+4&-4;g=vp(i<<2)|0;c[b+8>>2]=g;c[b>>2]=i|1;c[b+4>>2]=h;b=g}if((e|0)==(f|0)){i=b;c[i>>2]=0;return}d=(f-4+(-d|0)|0)>>>2;g=b;while(1){c[g>>2]=c[e>>2];e=e+4|0;if((e|0)==(f|0)){break}else{g=g+4|0}}i=b+(d+1<<2)|0;c[i>>2]=0;return}function Ii(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((b|0)==(d|0)){a=0;return a|0}else{a=0}do{a=(c[b>>2]|0)+(a<<4)|0;e=a&-268435456;a=(e>>>24|e)^a;b=b+4|0;}while((b|0)!=(d|0));return a|0}function Ji(a){a=a|0;vg(a|0);xp(a);return}function Ki(a){a=a|0;vg(a|0);return}function Li(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;k=i;i=i+112|0;r=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[r>>2];r=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[r>>2];r=k|0;t=k+16|0;p=k+32|0;x=k+40|0;u=k+48|0;w=k+56|0;v=k+64|0;s=k+72|0;n=k+80|0;o=k+104|0;if((c[g+4>>2]&1|0)==0){c[p>>2]=-1;l=c[(c[d>>2]|0)+16>>2]|0;m=e|0;c[u>>2]=c[m>>2];c[w>>2]=c[f>>2];Ic[l&127](x,d,u,w,g,h,p);l=c[x>>2]|0;c[m>>2]=l;m=c[p>>2]|0;if((m|0)==1){a[j]=1}else if((m|0)==0){a[j]=0}else{a[j]=1;c[h>>2]=4}c[b>>2]=l;i=k;return}sh(v,g);p=v|0;u=c[p>>2]|0;if((c[7716]|0)==-1){q=9}else{c[t>>2]=30864;c[t+4>>2]=18;c[t+8>>2]=0;y=0;Ha(4,30864,t|0,114);if(!y){q=9}else{y=0}}do{if((q|0)==9){d=(c[7717]|0)-1|0;t=c[u+8>>2]|0;do{if((c[u+12>>2]|0)-t>>2>>>0>d>>>0){t=c[t+(d<<2)>>2]|0;if((t|0)==0){break}xg(c[p>>2]|0)|0;sh(s,g);s=s|0;g=c[s>>2]|0;if((c[7620]|0)==-1){q=15}else{c[r>>2]=30480;c[r+4>>2]=18;c[r+8>>2]=0;y=0;Ha(4,30480,r|0,114);if(!y){q=15}else{y=0}}do{if((q|0)==15){q=(c[7621]|0)-1|0;r=c[g+8>>2]|0;do{if((c[g+12>>2]|0)-r>>2>>>0>q>>>0){g=c[r+(q<<2)>>2]|0;if((g|0)==0){break}r=g;xg(c[s>>2]|0)|0;q=n|0;y=0;qa(c[(c[g>>2]|0)+24>>2]|0,q|0,r|0);do{if(!y){u=n+12|0;y=0;qa(c[(c[g>>2]|0)+28>>2]|0,u|0,r|0);if(y){y=0;l=u;break}c[o>>2]=c[f>>2];h=(y=0,na(4,e|0,o|0,q|0,n+24|0,t|0,h|0,1)|0);if(!y){a[j]=(h|0)==(q|0)|0;c[b>>2]=c[e>>2];Yg(n+12|0);Yg(n|0);i=k;return}else{y=0;x=Mb(-1,-1)|0;Yg(n+12|0);Yg(n|0);db(x|0)}}else{y=0;l=q}}while(0);b=Mb(-1,-1)|0;k=L;if((q|0)==(l|0)){x=b;db(x|0)}else{m=l}do{m=m-12|0;Yg(m);}while((m|0)!=(q|0));x=b;db(x|0)}}while(0);x=lc(4)|0;Xo(x);y=0;Ha(16,x|0,25592,150);if(y){y=0;break}}}while(0);x=Mb(-1,-1)|0;xg(c[s>>2]|0)|0;db(x|0)}}while(0);x=lc(4)|0;Xo(x);y=0;Ha(16,x|0,25592,150);if(y){y=0;break}}}while(0);x=Mb(-1,-1)|0;xg(c[p>>2]|0)|0;db(x|0)}function Mi(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0;m=i;i=i+104|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=(g-f|0)/12|0;o=m|0;do{if(u>>>0>100>>>0){o=qp(u)|0;if((o|0)!=0){n=o;l=o;break}y=0;Ia(4);if(!y){n=0;l=0;break}else{y=0}A=Mb(-1,-1)|0;db(A|0)}else{n=o;l=0}}while(0);o=(f|0)==(g|0);if(o){t=0}else{t=0;p=n;q=f;while(1){r=d[q]|0;if((r&1|0)==0){r=r>>>1}else{r=c[q+4>>2]|0}if((r|0)==0){a[p]=2;t=t+1|0;u=u-1|0}else{a[p]=1}q=q+12|0;if((q|0)==(g|0)){break}else{p=p+1|0}}}b=b|0;e=e|0;p=h;q=0;a:while(1){w=c[b>>2]|0;do{if((w|0)==0){w=0}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){break}r=(y=0,ra(c[(c[w>>2]|0)+36>>2]|0,w|0)|0);if(y){y=0;h=6;break a}if((r|0)==-1){c[b>>2]=0;w=0;break}else{w=c[b>>2]|0;break}}}while(0);v=(w|0)==0;r=c[e>>2]|0;if((r|0)==0){r=0}else{do{if((c[r+12>>2]|0)==(c[r+16>>2]|0)){s=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;h=6;break a}if((s|0)!=-1){break}c[e>>2]=0;r=0}}while(0);w=c[b>>2]|0}s=(r|0)==0;if(!((v^s)&(u|0)!=0)){h=81;break}r=c[w+12>>2]|0;if((r|0)==(c[w+16>>2]|0)){r=(y=0,ra(c[(c[w>>2]|0)+36>>2]|0,w|0)|0);if(y){y=0;h=6;break}r=r&255}else{r=a[r]|0}if(!k){r=(y=0,Da(c[(c[p>>2]|0)+12>>2]|0,h|0,r|0)|0);if(y){y=0;h=6;break}}do{if(o){r=u}else{s=q+1|0;b:do{if(k){v=n;x=0;w=f;while(1){do{if((a[v]|0)==1){A=w;if((a[A]&1)==0){z=w+1|0}else{z=c[w+8>>2]|0}if(r<<24>>24!=(a[z+q|0]|0)){a[v]=0;u=u-1|0;break}x=d[A]|0;if((x&1|0)==0){x=x>>>1}else{x=c[w+4>>2]|0}if((x|0)!=(s|0)){x=1;break}a[v]=2;x=1;t=t+1|0;u=u-1|0}}while(0);w=w+12|0;if((w|0)==(g|0)){r=u;break b}v=v+1|0}}else{v=n;x=0;w=f;while(1){do{if((a[v]|0)==1){z=w;if((a[z]&1)==0){A=w+1|0}else{A=c[w+8>>2]|0}A=(y=0,Da(c[(c[p>>2]|0)+12>>2]|0,h|0,a[A+q|0]|0)|0);if(y){y=0;h=5;break a}if(r<<24>>24!=A<<24>>24){a[v]=0;u=u-1|0;break}x=d[z]|0;if((x&1|0)==0){x=x>>>1}else{x=c[w+4>>2]|0}if((x|0)!=(s|0)){x=1;break}a[v]=2;x=1;t=t+1|0;u=u-1|0}}while(0);w=w+12|0;if((w|0)==(g|0)){r=u;break b}v=v+1|0}}}while(0);if(!x){break}v=c[b>>2]|0;u=v+12|0;s=c[u>>2]|0;if((s|0)==(c[v+16>>2]|0)){A=c[(c[v>>2]|0)+40>>2]|0;y=0,ra(A|0,v|0)|0;if(y){y=0;h=6;break a}}else{c[u>>2]=s+1}if((t+r|0)>>>0<2>>>0|o){break}s=q+1|0;u=n;v=f;while(1){do{if((a[u]|0)==2){w=d[v]|0;if((w&1|0)==0){w=w>>>1}else{w=c[v+4>>2]|0}if((w|0)==(s|0)){break}a[u]=0;t=t-1|0}}while(0);v=v+12|0;if((v|0)==(g|0)){break}else{u=u+1|0}}}}while(0);q=q+1|0;u=r}if((h|0)==5){m=Mb(-1,-1)|0;}else if((h|0)==6){m=Mb(-1,-1)|0;}else if((h|0)==81){do{if((w|0)==0){w=0;h=87}else{if((c[w+12>>2]|0)!=(c[w+16>>2]|0)){h=87;break}k=(y=0,ra(c[(c[w>>2]|0)+36>>2]|0,w|0)|0);if(y){y=0;break}if((k|0)==-1){c[b>>2]=0;w=0;h=87;break}else{w=c[b>>2]|0;h=87;break}}}while(0);c:do{if((h|0)==87){k=(w|0)==0;do{if(s){h=93}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){if(k){break}else{h=95;break}}b=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break c}if((b|0)==-1){c[e>>2]=0;h=93;break}else{if(k^(r|0)==0){break}else{h=95;break}}}}while(0);if((h|0)==93){if(k){h=95}}if((h|0)==95){c[j>>2]=c[j>>2]|2}d:do{if(o){h=100}else{while(1){if((a[n]|0)==2){g=f;break d}f=f+12|0;if((f|0)==(g|0)){h=100;break d}n=n+1|0}}}while(0);if((h|0)==100){c[j>>2]=c[j>>2]|4}if((l|0)==0){i=m;return g|0}rp(l);i=m;return g|0}}while(0);m=Mb(-1,-1)|0;}if((l|0)==0){A=m;db(A|0)}rp(l);A=m;db(A|0);return 0}function Ni(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Oi(a,0,e,d,f,g,h);i=b;return}function Oi(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+72|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=e|0;F=e+32|0;p=e+40|0;o=e+56|0;z=o;w=i;i=i+4|0;i=i+7&-8;u=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==0){x=0}else if((x|0)==64){x=8}else if((x|0)==8){x=16}else{x=10}A=A|0;Ej(p,h,A,F);Pp(z|0,0,12)|0;h=o;y=0;Ha(26,o|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=o+8|0}else{B=o+8|0;I=c[B>>2]|0;C=h+1|0}c[w>>2]=I;h=u|0;c[t>>2]=h;c[v>>2]=0;f=f|0;g=g|0;E=o|0;D=o+4|0;F=a[F]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){q=G;break}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){m=21}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(r){H=0;break}else{s=I;l=G;n=0;break b}}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)==-1){c[g>>2]=0;m=21;break}else{H=(G|0)==0;if(r^H){break}else{s=I;l=G;n=H;break b}}}}while(0);if((m|0)==21){m=0;if(r){s=I;l=0;n=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[w>>2]|0)-I|0)==((K?J>>>1:c[D>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[D>>2]|0;I=J}y=0;Ha(26,o|0,I<<1|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=10}else{I=(c[E>>2]&-2)-1|0}y=0;Ha(26,o|0,I|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[w>>2]=I+J}K=q+12|0;L=c[K>>2]|0;J=q+16|0;if((L|0)==(c[J>>2]|0)){L=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;m=34;break}L=L&255}else{L=a[L]|0}if((ej(L,x,I,w,v,F,p,h,t,A)|0)!=0){s=I;l=G;n=H;break}G=c[K>>2]|0;if((G|0)==(c[J>>2]|0)){L=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(L|0,q|0)|0;if(!y){G=q;continue}else{y=0;m=34;break}}else{c[K>>2]=G+1;G=q;continue}}if((m|0)==34){L=Mb(-1,-1)|0;Yg(o);Yg(p);db(L|0)}z=d[p]|0;if((z&1|0)==0){z=z>>>1}else{z=c[p+4>>2]|0}do{if((z|0)!=0){z=c[t>>2]|0;if((z-u|0)>=160){break}L=c[v>>2]|0;c[t>>2]=z+4;c[z>>2]=L}}while(0);s=(y=0,Ka(18,s|0,c[w>>2]|0,j|0,x|0)|0);if(y){y=0;break}c[k>>2]=s;Rl(p,h,c[t>>2]|0,j);do{if(r){q=0}else{if((c[q+12>>2]|0)!=(c[q+16>>2]|0)){break}k=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}if((k|0)!=-1){break}c[f>>2]=0;q=0}}while(0);k=(q|0)==0;c:do{if(n){m=62}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){n=(y=0,ra(c[(c[l>>2]|0)+36>>2]|0,l|0)|0);if(y){y=0;break a}if((n|0)!=-1){break}c[g>>2]=0;m=62;break c}}while(0);if(!(k^(l|0)==0)){break}L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}}while(0);do{if((m|0)==62){if(k){break}L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}else{y=0}}while(0);L=Mb(-1,-1)|0;Yg(o);Yg(p);db(L|0)}function Pi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Qi(a,0,e,d,f,g,h);i=b;return}function Qi(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,M=0;o=i;i=i+72|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=o|0;F=o+32|0;p=o+40|0;e=o+56|0;z=e;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==0){x=0}else if((x|0)==8){x=16}else if((x|0)==64){x=8}else{x=10}A=A|0;Ej(p,h,A,F);Pp(z|0,0,12)|0;h=e;y=0;Ha(26,e|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=e+8|0}else{B=e+8|0;I=c[B>>2]|0;C=h+1|0}c[u>>2]=I;h=v|0;c[s>>2]=h;c[w>>2]=0;f=f|0;g=g|0;D=e|0;E=e+4|0;F=a[F]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){q=G;break}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){m=21}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(r){H=0;break}else{t=I;l=G;n=0;break b}}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)==-1){c[g>>2]=0;m=21;break}else{H=(G|0)==0;if(r^H){break}else{t=I;l=G;n=H;break b}}}}while(0);if((m|0)==21){m=0;if(r){t=I;l=0;n=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[u>>2]|0)-I|0)==((K?J>>>1:c[E>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[E>>2]|0;I=J}y=0;Ha(26,e|0,I<<1|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=10}else{I=(c[D>>2]&-2)-1|0}y=0;Ha(26,e|0,I|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[u>>2]=I+J}K=q+12|0;M=c[K>>2]|0;J=q+16|0;if((M|0)==(c[J>>2]|0)){M=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;m=34;break}M=M&255}else{M=a[M]|0}if((ej(M,x,I,u,w,F,p,h,s,A)|0)!=0){t=I;l=G;n=H;break}G=c[K>>2]|0;if((G|0)==(c[J>>2]|0)){M=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(M|0,q|0)|0;if(!y){G=q;continue}else{y=0;m=34;break}}else{c[K>>2]=G+1;G=q;continue}}if((m|0)==34){M=Mb(-1,-1)|0;Yg(e);Yg(p);db(M|0)}z=d[p]|0;if((z&1|0)==0){z=z>>>1}else{z=c[p+4>>2]|0}do{if((z|0)!=0){z=c[s>>2]|0;if((z-v|0)>=160){break}M=c[w>>2]|0;c[s>>2]=z+4;c[z>>2]=M}}while(0);t=(y=0,Ka(10,t|0,c[u>>2]|0,j|0,x|0)|0);u=L;if(y){y=0;break}c[k>>2]=t;c[k+4>>2]=u;Rl(p,h,c[s>>2]|0,j);do{if(r){q=0}else{if((c[q+12>>2]|0)!=(c[q+16>>2]|0)){break}r=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}if((r|0)!=-1){break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;c:do{if(n){m=62}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){n=(y=0,ra(c[(c[l>>2]|0)+36>>2]|0,l|0)|0);if(y){y=0;break a}if((n|0)!=-1){break}c[g>>2]=0;m=62;break c}}while(0);if(!(r^(l|0)==0)){break}M=b|0;c[M>>2]=q;Yg(e);Yg(p);i=o;return}}while(0);do{if((m|0)==62){if(r){break}M=b|0;c[M>>2]=q;Yg(e);Yg(p);i=o;return}}while(0);c[j>>2]=c[j>>2]|2;M=b|0;c[M>>2]=q;Yg(e);Yg(p);i=o;return}else{y=0}}while(0);M=Mb(-1,-1)|0;Yg(e);Yg(p);db(M|0)}function Ri(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Si(a,0,e,d,f,g,h);i=b;return}



function Si(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;f=i;i=i+72|0;B=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[B>>2];B=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[B>>2];B=f|0;G=f+32|0;q=f+40|0;p=f+56|0;A=p;x=i;i=i+4|0;i=i+7&-8;v=i;i=i+160|0;u=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;z=c[j+4>>2]&74;if((z|0)==0){z=0}else if((z|0)==64){z=8}else if((z|0)==8){z=16}else{z=10}B=B|0;Ej(q,j,B,G);Pp(A|0,0,12)|0;j=p;y=0;Ha(26,p|0,10,0);a:do{if(!y){if((a[A]&1)==0){D=j+1|0;J=D;C=p+8|0}else{C=p+8|0;J=c[C>>2]|0;D=j+1|0}c[x>>2]=J;j=v|0;c[u>>2]=j;c[w>>2]=0;g=g|0;h=h|0;F=p|0;E=p+4|0;G=a[G]|0;H=c[g>>2]|0;b:while(1){do{if((H|0)==0){r=0}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){r=H;break}I=(y=0,ra(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(y){y=0;n=34;break b}if((I|0)!=-1){r=H;break}c[g>>2]=0;r=0}}while(0);s=(r|0)==0;H=c[h>>2]|0;do{if((H|0)==0){n=21}else{if((c[H+12>>2]|0)!=(c[H+16>>2]|0)){if(s){I=0;break}else{t=J;m=H;o=0;break b}}I=(y=0,ra(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(y){y=0;n=34;break b}if((I|0)==-1){c[h>>2]=0;n=21;break}else{I=(H|0)==0;if(s^I){break}else{t=J;m=H;o=I;break b}}}}while(0);if((n|0)==21){n=0;if(s){t=J;m=0;o=1;break}else{H=0;I=1}}K=d[A]|0;L=(K&1|0)==0;if(((c[x>>2]|0)-J|0)==((L?K>>>1:c[E>>2]|0)|0)){if(L){J=K>>>1;K=K>>>1}else{K=c[E>>2]|0;J=K}y=0;Ha(26,p|0,J<<1|0,0);if(y){y=0;n=34;break}if((a[A]&1)==0){J=10}else{J=(c[F>>2]&-2)-1|0}y=0;Ha(26,p|0,J|0,0);if(y){y=0;n=34;break}if((a[A]&1)==0){J=D}else{J=c[C>>2]|0}c[x>>2]=J+K}L=r+12|0;M=c[L>>2]|0;K=r+16|0;if((M|0)==(c[K>>2]|0)){M=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;n=34;break}M=M&255}else{M=a[M]|0}if((ej(M,z,J,x,w,G,q,j,u,B)|0)!=0){t=J;m=H;o=I;break}H=c[L>>2]|0;if((H|0)==(c[K>>2]|0)){M=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(M|0,r|0)|0;if(!y){H=r;continue}else{y=0;n=34;break}}else{c[L>>2]=H+1;H=r;continue}}if((n|0)==34){M=Mb(-1,-1)|0;Yg(p);Yg(q);db(M|0)}A=d[q]|0;if((A&1|0)==0){A=A>>>1}else{A=c[q+4>>2]|0}do{if((A|0)!=0){A=c[u>>2]|0;if((A-v|0)>=160){break}M=c[w>>2]|0;c[u>>2]=A+4;c[A>>2]=M}}while(0);t=(y=0,Ka(14,t|0,c[x>>2]|0,k|0,z|0)|0);if(y){y=0;break}b[l>>1]=t;Rl(q,j,c[u>>2]|0,k);do{if(s){r=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){break}l=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break a}if((l|0)!=-1){break}c[g>>2]=0;r=0}}while(0);l=(r|0)==0;c:do{if(o){n=62}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){o=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}if((o|0)!=-1){break}c[h>>2]=0;n=62;break c}}while(0);if(!(l^(m|0)==0)){break}M=e|0;c[M>>2]=r;Yg(p);Yg(q);i=f;return}}while(0);do{if((n|0)==62){if(l){break}M=e|0;c[M>>2]=r;Yg(p);Yg(q);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;M=e|0;c[M>>2]=r;Yg(p);Yg(q);i=f;return}else{y=0}}while(0);M=Mb(-1,-1)|0;Yg(p);Yg(q);db(M|0)}function Ti(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Ui(a,0,e,d,f,g,h);i=b;return}function Ui(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+72|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=e|0;F=e+32|0;p=e+40|0;o=e+56|0;z=o;w=i;i=i+4|0;i=i+7&-8;u=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==0){x=0}else if((x|0)==8){x=16}else if((x|0)==64){x=8}else{x=10}A=A|0;Ej(p,h,A,F);Pp(z|0,0,12)|0;h=o;y=0;Ha(26,o|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=o+8|0}else{B=o+8|0;I=c[B>>2]|0;C=h+1|0}c[w>>2]=I;h=u|0;c[t>>2]=h;c[v>>2]=0;f=f|0;g=g|0;E=o|0;D=o+4|0;F=a[F]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){q=G;break}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){m=21}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(r){H=0;break}else{s=I;l=G;n=0;break b}}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)==-1){c[g>>2]=0;m=21;break}else{H=(G|0)==0;if(r^H){break}else{s=I;l=G;n=H;break b}}}}while(0);if((m|0)==21){m=0;if(r){s=I;l=0;n=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[w>>2]|0)-I|0)==((K?J>>>1:c[D>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[D>>2]|0;I=J}y=0;Ha(26,o|0,I<<1|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=10}else{I=(c[E>>2]&-2)-1|0}y=0;Ha(26,o|0,I|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[w>>2]=I+J}K=q+12|0;L=c[K>>2]|0;J=q+16|0;if((L|0)==(c[J>>2]|0)){L=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;m=34;break}L=L&255}else{L=a[L]|0}if((ej(L,x,I,w,v,F,p,h,t,A)|0)!=0){s=I;l=G;n=H;break}G=c[K>>2]|0;if((G|0)==(c[J>>2]|0)){L=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(L|0,q|0)|0;if(!y){G=q;continue}else{y=0;m=34;break}}else{c[K>>2]=G+1;G=q;continue}}if((m|0)==34){L=Mb(-1,-1)|0;Yg(o);Yg(p);db(L|0)}z=d[p]|0;if((z&1|0)==0){z=z>>>1}else{z=c[p+4>>2]|0}do{if((z|0)!=0){z=c[t>>2]|0;if((z-u|0)>=160){break}L=c[v>>2]|0;c[t>>2]=z+4;c[z>>2]=L}}while(0);s=(y=0,Ka(6,s|0,c[w>>2]|0,j|0,x|0)|0);if(y){y=0;break}c[k>>2]=s;Rl(p,h,c[t>>2]|0,j);do{if(r){q=0}else{if((c[q+12>>2]|0)!=(c[q+16>>2]|0)){break}k=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}if((k|0)!=-1){break}c[f>>2]=0;q=0}}while(0);k=(q|0)==0;c:do{if(n){m=62}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){n=(y=0,ra(c[(c[l>>2]|0)+36>>2]|0,l|0)|0);if(y){y=0;break a}if((n|0)!=-1){break}c[g>>2]=0;m=62;break c}}while(0);if(!(k^(l|0)==0)){break}L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}}while(0);do{if((m|0)==62){if(k){break}L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}else{y=0}}while(0);L=Mb(-1,-1)|0;Yg(o);Yg(p);db(L|0)}function Vi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Wi(a,0,e,d,f,g,h);i=b;return}function Wi(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+72|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=e|0;F=e+32|0;p=e+40|0;o=e+56|0;z=o;w=i;i=i+4|0;i=i+7&-8;u=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==0){x=0}else if((x|0)==64){x=8}else if((x|0)==8){x=16}else{x=10}A=A|0;Ej(p,h,A,F);Pp(z|0,0,12)|0;h=o;y=0;Ha(26,o|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=o+8|0}else{B=o+8|0;I=c[B>>2]|0;C=h+1|0}c[w>>2]=I;h=u|0;c[t>>2]=h;c[v>>2]=0;f=f|0;g=g|0;E=o|0;D=o+4|0;F=a[F]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){q=G;break}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){m=21}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(r){H=0;break}else{s=I;l=G;n=0;break b}}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)==-1){c[g>>2]=0;m=21;break}else{H=(G|0)==0;if(r^H){break}else{s=I;l=G;n=H;break b}}}}while(0);if((m|0)==21){m=0;if(r){s=I;l=0;n=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[w>>2]|0)-I|0)==((K?J>>>1:c[D>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[D>>2]|0;I=J}y=0;Ha(26,o|0,I<<1|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=10}else{I=(c[E>>2]&-2)-1|0}y=0;Ha(26,o|0,I|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[w>>2]=I+J}K=q+12|0;L=c[K>>2]|0;J=q+16|0;if((L|0)==(c[J>>2]|0)){L=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;m=34;break}L=L&255}else{L=a[L]|0}if((ej(L,x,I,w,v,F,p,h,t,A)|0)!=0){s=I;l=G;n=H;break}G=c[K>>2]|0;if((G|0)==(c[J>>2]|0)){L=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(L|0,q|0)|0;if(!y){G=q;continue}else{y=0;m=34;break}}else{c[K>>2]=G+1;G=q;continue}}if((m|0)==34){L=Mb(-1,-1)|0;Yg(o);Yg(p);db(L|0)}z=d[p]|0;if((z&1|0)==0){z=z>>>1}else{z=c[p+4>>2]|0}do{if((z|0)!=0){z=c[t>>2]|0;if((z-u|0)>=160){break}L=c[v>>2]|0;c[t>>2]=z+4;c[z>>2]=L}}while(0);s=(y=0,Ka(22,s|0,c[w>>2]|0,j|0,x|0)|0);if(y){y=0;break}c[k>>2]=s;Rl(p,h,c[t>>2]|0,j);do{if(r){q=0}else{if((c[q+12>>2]|0)!=(c[q+16>>2]|0)){break}k=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}if((k|0)!=-1){break}c[f>>2]=0;q=0}}while(0);k=(q|0)==0;c:do{if(n){m=62}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){n=(y=0,ra(c[(c[l>>2]|0)+36>>2]|0,l|0)|0);if(y){y=0;break a}if((n|0)!=-1){break}c[g>>2]=0;m=62;break c}}while(0);if(!(k^(l|0)==0)){break}L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}}while(0);do{if((m|0)==62){if(k){break}L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;L=b|0;c[L>>2]=q;Yg(o);Yg(p);i=e;return}else{y=0}}while(0);L=Mb(-1,-1)|0;Yg(o);Yg(p);db(L|0)}function Xi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Yi(a,0,e,d,f,g,h);i=b;return}function Yi(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,M=0;o=i;i=i+72|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=o|0;F=o+32|0;p=o+40|0;e=o+56|0;z=e;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+160|0;s=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==0){x=0}else if((x|0)==8){x=16}else if((x|0)==64){x=8}else{x=10}A=A|0;Ej(p,h,A,F);Pp(z|0,0,12)|0;h=e;y=0;Ha(26,e|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=e+8|0}else{B=e+8|0;I=c[B>>2]|0;C=h+1|0}c[u>>2]=I;h=v|0;c[s>>2]=h;c[w>>2]=0;f=f|0;g=g|0;D=e|0;E=e+4|0;F=a[F]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){q=G;break}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){m=21}else{if((c[G+12>>2]|0)!=(c[G+16>>2]|0)){if(r){H=0;break}else{t=I;l=G;n=0;break b}}H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=34;break b}if((H|0)==-1){c[g>>2]=0;m=21;break}else{H=(G|0)==0;if(r^H){break}else{t=I;l=G;n=H;break b}}}}while(0);if((m|0)==21){m=0;if(r){t=I;l=0;n=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[u>>2]|0)-I|0)==((K?J>>>1:c[E>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[E>>2]|0;I=J}y=0;Ha(26,e|0,I<<1|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=10}else{I=(c[D>>2]&-2)-1|0}y=0;Ha(26,e|0,I|0,0);if(y){y=0;m=34;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[u>>2]=I+J}K=q+12|0;M=c[K>>2]|0;J=q+16|0;if((M|0)==(c[J>>2]|0)){M=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;m=34;break}M=M&255}else{M=a[M]|0}if((ej(M,x,I,u,w,F,p,h,s,A)|0)!=0){t=I;l=G;n=H;break}G=c[K>>2]|0;if((G|0)==(c[J>>2]|0)){M=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(M|0,q|0)|0;if(!y){G=q;continue}else{y=0;m=34;break}}else{c[K>>2]=G+1;G=q;continue}}if((m|0)==34){M=Mb(-1,-1)|0;Yg(e);Yg(p);db(M|0)}z=d[p]|0;if((z&1|0)==0){z=z>>>1}else{z=c[p+4>>2]|0}do{if((z|0)!=0){z=c[s>>2]|0;if((z-v|0)>=160){break}M=c[w>>2]|0;c[s>>2]=z+4;c[z>>2]=M}}while(0);t=(y=0,Ka(30,t|0,c[u>>2]|0,j|0,x|0)|0);u=L;if(y){y=0;break}c[k>>2]=t;c[k+4>>2]=u;Rl(p,h,c[s>>2]|0,j);do{if(r){q=0}else{if((c[q+12>>2]|0)!=(c[q+16>>2]|0)){break}r=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}if((r|0)!=-1){break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;c:do{if(n){m=62}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){n=(y=0,ra(c[(c[l>>2]|0)+36>>2]|0,l|0)|0);if(y){y=0;break a}if((n|0)!=-1){break}c[g>>2]=0;m=62;break c}}while(0);if(!(r^(l|0)==0)){break}M=b|0;c[M>>2]=q;Yg(e);Yg(p);i=o;return}}while(0);do{if((m|0)==62){if(r){break}M=b|0;c[M>>2]=q;Yg(e);Yg(p);i=o;return}}while(0);c[j>>2]=c[j>>2]|2;M=b|0;c[M>>2]=q;Yg(e);Yg(p);i=o;return}else{y=0}}while(0);M=Mb(-1,-1)|0;Yg(e);Yg(p);db(M|0)}function Zi(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];_i(a,0,e,d,f,g,h);i=b;return}function _i(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0;p=i;i=i+80|0;H=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[H>>2];H=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[H>>2];H=p+32|0;I=p+40|0;q=p+48|0;e=p+64|0;B=e;v=i;i=i+4|0;i=i+7&-8;x=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;z=i;i=i+1|0;i=i+7&-8;A=i;i=i+1|0;i=i+7&-8;C=p|0;Fj(q,j,C,H,I);Pp(B|0,0,12)|0;j=e;y=0;Ha(26,e|0,10,0);a:do{if(!y){if((a[B]&1)==0){D=j+1|0;L=D;E=e+8|0}else{E=e+8|0;L=c[E>>2]|0;D=j+1|0}c[v>>2]=L;j=x|0;c[t>>2]=j;c[w>>2]=0;a[z]=1;a[A]=69;f=f|0;h=h|0;G=e|0;F=e+4|0;H=a[H]|0;I=a[I]|0;K=c[f>>2]|0;b:while(1){do{if((K|0)==0){r=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){r=K;break}J=(y=0,ra(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(y){y=0;n=30;break b}if((J|0)!=-1){r=K;break}c[f>>2]=0;r=0}}while(0);s=(r|0)==0;J=c[h>>2]|0;do{if((J|0)==0){n=17}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(s){K=0;break}else{u=L;m=J;o=0;break b}}K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=30;break b}if((K|0)==-1){c[h>>2]=0;n=17;break}else{K=(J|0)==0;if(s^K){break}else{u=L;m=J;o=K;break b}}}}while(0);if((n|0)==17){n=0;if(s){u=L;m=0;o=1;break}else{J=0;K=1}}M=d[B]|0;N=(M&1|0)==0;if(((c[v>>2]|0)-L|0)==((N?M>>>1:c[F>>2]|0)|0)){if(N){L=M>>>1;M=M>>>1}else{M=c[F>>2]|0;L=M}y=0;Ha(26,e|0,L<<1|0,0);if(y){y=0;n=30;break}if((a[B]&1)==0){L=10}else{L=(c[G>>2]&-2)-1|0}y=0;Ha(26,e|0,L|0,0);if(y){y=0;n=30;break}if((a[B]&1)==0){L=D}else{L=c[E>>2]|0}c[v>>2]=L+M}N=r+12|0;O=c[N>>2]|0;M=r+16|0;if((O|0)==(c[M>>2]|0)){O=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;n=30;break}O=O&255}else{O=a[O]|0}if((Gj(O,z,A,L,v,H,I,q,j,t,w,C)|0)!=0){u=L;m=J;o=K;break}J=c[N>>2]|0;if((J|0)==(c[M>>2]|0)){O=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(O|0,r|0)|0;if(!y){K=r;continue}else{y=0;n=30;break}}else{c[N>>2]=J+1;K=r;continue}}if((n|0)==30){O=Mb(-1,-1)|0;Yg(e);Yg(q);db(O|0)}A=d[q]|0;if((A&1|0)==0){A=A>>>1}else{A=c[q+4>>2]|0}do{if((A|0)!=0){if((a[z]&1)==0){break}z=c[t>>2]|0;if((z-x|0)>=160){break}O=c[w>>2]|0;c[t>>2]=z+4;c[z>>2]=O}}while(0);P=(y=0,+(+ya(2,u|0,c[v>>2]|0,k|0)));if(y){y=0;break}g[l>>2]=P;Rl(q,j,c[t>>2]|0,k);do{if(s){r=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){break}s=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break a}if((s|0)!=-1){break}c[f>>2]=0;r=0}}while(0);s=(r|0)==0;c:do{if(o){n=59}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){o=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}if((o|0)!=-1){break}c[h>>2]=0;n=59;break c}}while(0);if(!(s^(m|0)==0)){break}O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}}while(0);do{if((n|0)==59){if(s){break}O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}else{y=0}}while(0);O=Mb(-1,-1)|0;Yg(e);Yg(q);db(O|0)}function $i(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];aj(a,0,e,d,f,g,h);i=b;return}function aj(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0;p=i;i=i+80|0;H=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[H>>2];H=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[H>>2];H=p+32|0;I=p+40|0;q=p+48|0;e=p+64|0;B=e;v=i;i=i+4|0;i=i+7&-8;x=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;z=i;i=i+1|0;i=i+7&-8;A=i;i=i+1|0;i=i+7&-8;C=p|0;Fj(q,j,C,H,I);Pp(B|0,0,12)|0;j=e;y=0;Ha(26,e|0,10,0);a:do{if(!y){if((a[B]&1)==0){D=j+1|0;L=D;E=e+8|0}else{E=e+8|0;L=c[E>>2]|0;D=j+1|0}c[v>>2]=L;j=x|0;c[t>>2]=j;c[w>>2]=0;a[z]=1;a[A]=69;f=f|0;g=g|0;G=e|0;F=e+4|0;H=a[H]|0;I=a[I]|0;K=c[f>>2]|0;b:while(1){do{if((K|0)==0){r=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){r=K;break}J=(y=0,ra(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(y){y=0;n=30;break b}if((J|0)!=-1){r=K;break}c[f>>2]=0;r=0}}while(0);s=(r|0)==0;J=c[g>>2]|0;do{if((J|0)==0){n=17}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(s){K=0;break}else{u=L;m=J;o=0;break b}}K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=30;break b}if((K|0)==-1){c[g>>2]=0;n=17;break}else{K=(J|0)==0;if(s^K){break}else{u=L;m=J;o=K;break b}}}}while(0);if((n|0)==17){n=0;if(s){u=L;m=0;o=1;break}else{J=0;K=1}}M=d[B]|0;N=(M&1|0)==0;if(((c[v>>2]|0)-L|0)==((N?M>>>1:c[F>>2]|0)|0)){if(N){L=M>>>1;M=M>>>1}else{M=c[F>>2]|0;L=M}y=0;Ha(26,e|0,L<<1|0,0);if(y){y=0;n=30;break}if((a[B]&1)==0){L=10}else{L=(c[G>>2]&-2)-1|0}y=0;Ha(26,e|0,L|0,0);if(y){y=0;n=30;break}if((a[B]&1)==0){L=D}else{L=c[E>>2]|0}c[v>>2]=L+M}N=r+12|0;O=c[N>>2]|0;M=r+16|0;if((O|0)==(c[M>>2]|0)){O=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;n=30;break}O=O&255}else{O=a[O]|0}if((Gj(O,z,A,L,v,H,I,q,j,t,w,C)|0)!=0){u=L;m=J;o=K;break}J=c[N>>2]|0;if((J|0)==(c[M>>2]|0)){O=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(O|0,r|0)|0;if(!y){K=r;continue}else{y=0;n=30;break}}else{c[N>>2]=J+1;K=r;continue}}if((n|0)==30){O=Mb(-1,-1)|0;Yg(e);Yg(q);db(O|0)}A=d[q]|0;if((A&1|0)==0){A=A>>>1}else{A=c[q+4>>2]|0}do{if((A|0)!=0){if((a[z]&1)==0){break}z=c[t>>2]|0;if((z-x|0)>=160){break}O=c[w>>2]|0;c[t>>2]=z+4;c[z>>2]=O}}while(0);P=(y=0,+(+Ea(4,u|0,c[v>>2]|0,k|0)));if(y){y=0;break}h[l>>3]=P;Rl(q,j,c[t>>2]|0,k);do{if(s){r=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){break}s=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break a}if((s|0)!=-1){break}c[f>>2]=0;r=0}}while(0);s=(r|0)==0;c:do{if(o){n=59}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){o=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}if((o|0)!=-1){break}c[g>>2]=0;n=59;break c}}while(0);if(!(s^(m|0)==0)){break}O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}}while(0);do{if((n|0)==59){if(s){break}O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}else{y=0}}while(0);O=Mb(-1,-1)|0;Yg(e);Yg(q);db(O|0)}function bj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];cj(a,0,e,d,f,g,h);i=b;return}function cj(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0;p=i;i=i+80|0;H=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[H>>2];H=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[H>>2];H=p+32|0;I=p+40|0;q=p+48|0;e=p+64|0;B=e;v=i;i=i+4|0;i=i+7&-8;x=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;z=i;i=i+1|0;i=i+7&-8;A=i;i=i+1|0;i=i+7&-8;C=p|0;Fj(q,j,C,H,I);Pp(B|0,0,12)|0;j=e;y=0;Ha(26,e|0,10,0);a:do{if(!y){if((a[B]&1)==0){D=j+1|0;L=D;E=e+8|0}else{E=e+8|0;L=c[E>>2]|0;D=j+1|0}c[v>>2]=L;j=x|0;c[t>>2]=j;c[w>>2]=0;a[z]=1;a[A]=69;f=f|0;g=g|0;G=e|0;F=e+4|0;H=a[H]|0;I=a[I]|0;K=c[f>>2]|0;b:while(1){do{if((K|0)==0){r=0}else{if((c[K+12>>2]|0)!=(c[K+16>>2]|0)){r=K;break}J=(y=0,ra(c[(c[K>>2]|0)+36>>2]|0,K|0)|0);if(y){y=0;n=30;break b}if((J|0)!=-1){r=K;break}c[f>>2]=0;r=0}}while(0);s=(r|0)==0;J=c[g>>2]|0;do{if((J|0)==0){n=17}else{if((c[J+12>>2]|0)!=(c[J+16>>2]|0)){if(s){K=0;break}else{u=L;m=J;o=0;break b}}K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=30;break b}if((K|0)==-1){c[g>>2]=0;n=17;break}else{K=(J|0)==0;if(s^K){break}else{u=L;m=J;o=K;break b}}}}while(0);if((n|0)==17){n=0;if(s){u=L;m=0;o=1;break}else{J=0;K=1}}M=d[B]|0;N=(M&1|0)==0;if(((c[v>>2]|0)-L|0)==((N?M>>>1:c[F>>2]|0)|0)){if(N){L=M>>>1;M=M>>>1}else{M=c[F>>2]|0;L=M}y=0;Ha(26,e|0,L<<1|0,0);if(y){y=0;n=30;break}if((a[B]&1)==0){L=10}else{L=(c[G>>2]&-2)-1|0}y=0;Ha(26,e|0,L|0,0);if(y){y=0;n=30;break}if((a[B]&1)==0){L=D}else{L=c[E>>2]|0}c[v>>2]=L+M}N=r+12|0;O=c[N>>2]|0;M=r+16|0;if((O|0)==(c[M>>2]|0)){O=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;n=30;break}O=O&255}else{O=a[O]|0}if((Gj(O,z,A,L,v,H,I,q,j,t,w,C)|0)!=0){u=L;m=J;o=K;break}J=c[N>>2]|0;if((J|0)==(c[M>>2]|0)){O=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(O|0,r|0)|0;if(!y){K=r;continue}else{y=0;n=30;break}}else{c[N>>2]=J+1;K=r;continue}}if((n|0)==30){O=Mb(-1,-1)|0;Yg(e);Yg(q);db(O|0)}A=d[q]|0;if((A&1|0)==0){A=A>>>1}else{A=c[q+4>>2]|0}do{if((A|0)!=0){if((a[z]&1)==0){break}z=c[t>>2]|0;if((z-x|0)>=160){break}O=c[w>>2]|0;c[t>>2]=z+4;c[z>>2]=O}}while(0);P=(y=0,+(+Ea(2,u|0,c[v>>2]|0,k|0)));if(y){y=0;break}h[l>>3]=P;Rl(q,j,c[t>>2]|0,k);do{if(s){r=0}else{if((c[r+12>>2]|0)!=(c[r+16>>2]|0)){break}s=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break a}if((s|0)!=-1){break}c[f>>2]=0;r=0}}while(0);s=(r|0)==0;c:do{if(o){n=59}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){o=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}if((o|0)!=-1){break}c[g>>2]=0;n=59;break c}}while(0);if(!(s^(m|0)==0)){break}O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}}while(0);do{if((n|0)==59){if(s){break}O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=r;Yg(e);Yg(q);i=p;return}else{y=0}}while(0);O=Mb(-1,-1)|0;Yg(e);Yg(q);db(O|0)}function dj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0;n=i;i=i+64|0;t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[t>>2];t=n|0;s=n+16|0;m=n+48|0;u=i;i=i+4|0;i=i+7&-8;e=i;i=i+12|0;i=i+7&-8;o=i;i=i+4|0;i=i+7&-8;v=i;i=i+160|0;p=i;i=i+4|0;i=i+7&-8;q=i;i=i+4|0;i=i+7&-8;Pp(m|0,0,12)|0;r=e;y=0;qa(84,u|0,h|0);if(y){y=0;D=Mb(-1,-1)|0;Yg(m);db(D|0)}h=u|0;u=c[h>>2]|0;if((c[7716]|0)==-1){l=4}else{c[t>>2]=30864;c[t+4>>2]=18;c[t+8>>2]=0;y=0;Ha(4,30864,t|0,114);if(!y){l=4}else{y=0}}a:do{if((l|0)==4){w=(c[7717]|0)-1|0;t=c[u+8>>2]|0;do{if((c[u+12>>2]|0)-t>>2>>>0>w>>>0){t=c[t+(w<<2)>>2]|0;if((t|0)==0){break}D=t;s=s|0;C=c[(c[t>>2]|0)+32>>2]|0;y=0,Ka(C|0,D|0,27240,27266,s|0)|0;if(y){y=0;break a}xg(c[h>>2]|0)|0;Pp(r|0,0,12)|0;t=e;y=0;Ha(26,e|0,10,0);b:do{if(!y){if((a[r]&1)==0){u=t+1|0;A=u;t=e+8|0}else{D=e+8|0;A=c[D>>2]|0;u=t+1|0;t=D}c[o>>2]=A;v=v|0;c[p>>2]=v;c[q>>2]=0;f=f|0;g=g|0;w=e|0;x=e+4|0;z=c[f>>2]|0;c:while(1){do{if((z|0)==0){z=0}else{if((c[z+12>>2]|0)!=(c[z+16>>2]|0)){break}B=(y=0,ra(c[(c[z>>2]|0)+36>>2]|0,z|0)|0);if(y){y=0;l=40;break c}if((B|0)!=-1){break}c[f>>2]=0;z=0}}while(0);B=(z|0)==0;D=c[g>>2]|0;do{if((D|0)==0){l=25}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(B){break}else{break c}}C=(y=0,ra(c[(c[D>>2]|0)+36>>2]|0,D|0)|0);if(y){y=0;l=40;break c}if((C|0)==-1){c[g>>2]=0;l=25;break}else{if(B^(D|0)==0){break}else{break c}}}}while(0);if((l|0)==25){l=0;if(B){break}}B=d[r]|0;C=(B&1|0)==0;if(((c[o>>2]|0)-A|0)==((C?B>>>1:c[x>>2]|0)|0)){if(C){A=B>>>1;B=B>>>1}else{B=c[x>>2]|0;A=B}y=0;Ha(26,e|0,A<<1|0,0);if(y){y=0;l=40;break}if((a[r]&1)==0){A=10}else{A=(c[w>>2]&-2)-1|0}y=0;Ha(26,e|0,A|0,0);if(y){y=0;l=40;break}if((a[r]&1)==0){A=u}else{A=c[t>>2]|0}c[o>>2]=A+B}C=z+12|0;D=c[C>>2]|0;B=z+16|0;if((D|0)==(c[B>>2]|0)){D=(y=0,ra(c[(c[z>>2]|0)+36>>2]|0,z|0)|0);if(y){y=0;l=40;break}D=D&255}else{D=a[D]|0}if((ej(D,16,A,o,q,0,m,v,p,s)|0)!=0){break}D=c[C>>2]|0;if((D|0)==(c[B>>2]|0)){D=c[(c[z>>2]|0)+40>>2]|0;y=0,ra(D|0,z|0)|0;if(!y){continue}else{y=0;l=40;break}}else{c[C>>2]=D+1;continue}}if((l|0)==40){j=Mb(-1,-1)|0;break}a[A+3|0]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}o=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=o;break}else{y=0;j=Mb(-1,-1)|0;break b}}}while(0);k=(y=0,Ka(32,A|0,c[7330]|0,15248,(D=i,i=i+8|0,c[D>>2]=k,D)|0)|0);i=D;if(y){y=0;l=41;break}if((k|0)!=1){c[j>>2]=4}o=c[f>>2]|0;do{if((o|0)==0){o=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){break}k=(y=0,ra(c[(c[o>>2]|0)+36>>2]|0,o|0)|0);if(y){y=0;l=41;break b}if((k|0)!=-1){break}c[f>>2]=0;o=0}}while(0);q=(o|0)==0;p=c[g>>2]|0;do{if((p|0)==0){l=70}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){if(!q){break}D=b|0;c[D>>2]=o;Yg(e);Yg(m);i=n;return}k=(y=0,ra(c[(c[p>>2]|0)+36>>2]|0,p|0)|0);if(y){y=0;l=41;break b}if((k|0)==-1){c[g>>2]=0;l=70;break}if(!(q^(p|0)==0)){break}D=b|0;c[D>>2]=o;Yg(e);Yg(m);i=n;return}}while(0);do{if((l|0)==70){if(q){break}D=b|0;c[D>>2]=o;Yg(e);Yg(m);i=n;return}}while(0);c[j>>2]=c[j>>2]|2;D=b|0;c[D>>2]=o;Yg(e);Yg(m);i=n;return}else{y=0;l=41}}while(0);if((l|0)==41){j=Mb(-1,-1)|0;}Yg(e);D=j;Yg(m);db(D|0)}}while(0);D=lc(4)|0;Xo(D);y=0;Ha(16,D|0,25592,150);if(y){y=0;break}}}while(0);D=Mb(-1,-1)|0;xg(c[h>>2]|0)|0;Yg(m);db(D|0)}function ej(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0;o=c[g>>2]|0;n=(o|0)==(f|0);do{if(n){p=(a[m+24|0]|0)==b<<24>>24;if(!p){if((a[m+25|0]|0)!=b<<24>>24){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;p=0;return p|0}}while(0);p=d[j]|0;if((p&1|0)==0){j=p>>>1}else{j=c[j+4>>2]|0}if((j|0)!=0&b<<24>>24==i<<24>>24){f=c[l>>2]|0;if((f-k|0)>=160){p=0;return p|0}p=c[h>>2]|0;c[l>>2]=f+4;c[f>>2]=p;c[h>>2]=0;p=0;return p|0}l=m+26|0;k=m;while(1){i=k+1|0;if((a[k]|0)==b<<24>>24){break}if((i|0)==(l|0)){k=l;break}else{k=i}}m=k-m|0;if((m|0)>23){p=-1;return p|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{h=-1}return h|0}else if((e|0)==16){if((m|0)<22){break}if(n){p=-1;return p|0}if((o-f|0)>=3){p=-1;return p|0}if((a[o-1|0]|0)!=48){p=-1;return p|0}c[h>>2]=0;j=a[27240+m|0]|0;p=c[g>>2]|0;c[g>>2]=p+1;a[p]=j;p=0;return p|0}}while(0);p=a[27240+m|0]|0;c[g>>2]=o+1;a[o]=p;c[h>>2]=(c[h>>2]|0)+1;p=0;return p|0}function fj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;b=_b(b|0)|0;d=fb(a|0,d|0,g|0)|0;if((b|0)==0){i=f;return d|0}y=0,ra(44,b|0)|0;if(!y){i=f;return d|0}else{y=0;h=Mb(-1,-1,0)|0;nd(h);return 0}return 0}function gj(a){a=a|0;vg(a|0);xp(a);return}function hj(a){a=a|0;vg(a|0);return}function ij(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;k=i;i=i+112|0;r=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[r>>2];r=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[r>>2];r=k|0;t=k+16|0;p=k+32|0;x=k+40|0;u=k+48|0;w=k+56|0;v=k+64|0;s=k+72|0;n=k+80|0;o=k+104|0;if((c[g+4>>2]&1|0)==0){c[p>>2]=-1;l=c[(c[d>>2]|0)+16>>2]|0;m=e|0;c[u>>2]=c[m>>2];c[w>>2]=c[f>>2];Ic[l&127](x,d,u,w,g,h,p);l=c[x>>2]|0;c[m>>2]=l;m=c[p>>2]|0;if((m|0)==0){a[j]=0}else if((m|0)==1){a[j]=1}else{a[j]=1;c[h>>2]=4}c[b>>2]=l;i=k;return}sh(v,g);p=v|0;u=c[p>>2]|0;if((c[7714]|0)==-1){q=9}else{c[t>>2]=30856;c[t+4>>2]=18;c[t+8>>2]=0;y=0;Ha(4,30856,t|0,114);if(!y){q=9}else{y=0}}do{if((q|0)==9){d=(c[7715]|0)-1|0;t=c[u+8>>2]|0;do{if((c[u+12>>2]|0)-t>>2>>>0>d>>>0){t=c[t+(d<<2)>>2]|0;if((t|0)==0){break}xg(c[p>>2]|0)|0;sh(s,g);s=s|0;g=c[s>>2]|0;if((c[7618]|0)==-1){q=15}else{c[r>>2]=30472;c[r+4>>2]=18;c[r+8>>2]=0;y=0;Ha(4,30472,r|0,114);if(!y){q=15}else{y=0}}do{if((q|0)==15){q=(c[7619]|0)-1|0;r=c[g+8>>2]|0;do{if((c[g+12>>2]|0)-r>>2>>>0>q>>>0){g=c[r+(q<<2)>>2]|0;if((g|0)==0){break}r=g;xg(c[s>>2]|0)|0;q=n|0;y=0;qa(c[(c[g>>2]|0)+24>>2]|0,q|0,r|0);do{if(!y){u=n+12|0;y=0;qa(c[(c[g>>2]|0)+28>>2]|0,u|0,r|0);if(y){y=0;l=u;break}c[o>>2]=c[f>>2];h=(y=0,na(2,e|0,o|0,q|0,n+24|0,t|0,h|0,1)|0);if(!y){a[j]=(h|0)==(q|0)|0;c[b>>2]=c[e>>2];jh(n+12|0);jh(n|0);i=k;return}else{y=0;x=Mb(-1,-1)|0;jh(n+12|0);jh(n|0);db(x|0)}}else{y=0;l=q}}while(0);b=Mb(-1,-1)|0;k=L;if((q|0)==(l|0)){x=b;db(x|0)}else{m=l}do{m=m-12|0;jh(m);}while((m|0)!=(q|0));x=b;db(x|0)}}while(0);x=lc(4)|0;Xo(x);y=0;Ha(16,x|0,25592,150);if(y){y=0;break}}}while(0);x=Mb(-1,-1)|0;xg(c[s>>2]|0)|0;db(x|0)}}while(0);x=lc(4)|0;Xo(x);y=0;Ha(16,x|0,25592,150);if(y){y=0;break}}}while(0);x=Mb(-1,-1)|0;xg(c[p>>2]|0)|0;db(x|0)}function jj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0;m=i;i=i+104|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=(g-f|0)/12|0;o=m|0;do{if(u>>>0>100>>>0){o=qp(u)|0;if((o|0)!=0){n=o;l=o;break}y=0;Ia(4);if(!y){n=0;l=0;break}else{y=0}A=Mb(-1,-1)|0;db(A|0)}else{n=o;l=0}}while(0);o=(f|0)==(g|0);if(o){t=0}else{t=0;p=n;q=f;while(1){r=d[q]|0;if((r&1|0)==0){r=r>>>1}else{r=c[q+4>>2]|0}if((r|0)==0){a[p]=2;t=t+1|0;u=u-1|0}else{a[p]=1}q=q+12|0;if((q|0)==(g|0)){break}else{p=p+1|0}}}b=b|0;e=e|0;p=h;q=0;a:while(1){s=c[b>>2]|0;do{if((s|0)==0){w=0}else{r=c[s+12>>2]|0;if((r|0)==(c[s+16>>2]|0)){r=(y=0,ra(c[(c[s>>2]|0)+36>>2]|0,s|0)|0);if(y){y=0;h=6;break a}}else{r=c[r>>2]|0}if((r|0)==-1){c[b>>2]=0;w=0;break}else{w=c[b>>2]|0;break}}}while(0);s=(w|0)==0;r=c[e>>2]|0;if((r|0)==0){r=0}else{v=c[r+12>>2]|0;if((v|0)==(c[r+16>>2]|0)){v=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;h=6;break}}else{v=c[v>>2]|0}if((v|0)==-1){c[e>>2]=0;r=0}w=c[b>>2]|0}v=(r|0)==0;if(!((s^v)&(u|0)!=0)){h=82;break}r=c[w+12>>2]|0;if((r|0)==(c[w+16>>2]|0)){s=(y=0,ra(c[(c[w>>2]|0)+36>>2]|0,w|0)|0);if(y){y=0;h=6;break}}else{s=c[r>>2]|0}if(!k){s=(y=0,Da(c[(c[p>>2]|0)+28>>2]|0,h|0,s|0)|0);if(y){y=0;h=6;break}}do{if(!o){r=q+1|0;b:do{if(k){v=n;x=0;w=f;while(1){do{if((a[v]|0)==1){z=w;if((a[z]&1)==0){A=w+4|0}else{A=c[w+8>>2]|0}if((s|0)!=(c[A+(q<<2)>>2]|0)){a[v]=0;u=u-1|0;break}x=d[z]|0;if((x&1|0)==0){x=x>>>1}else{x=c[w+4>>2]|0}if((x|0)!=(r|0)){x=1;break}a[v]=2;x=1;t=t+1|0;u=u-1|0}}while(0);w=w+12|0;if((w|0)==(g|0)){break b}v=v+1|0}}else{v=n;x=0;w=f;while(1){do{if((a[v]|0)==1){z=w;if((a[z]&1)==0){A=w+4|0}else{A=c[w+8>>2]|0}A=(y=0,Da(c[(c[p>>2]|0)+28>>2]|0,h|0,c[A+(q<<2)>>2]|0)|0);if(y){y=0;h=5;break a}if((s|0)!=(A|0)){a[v]=0;u=u-1|0;break}x=d[z]|0;if((x&1|0)==0){x=x>>>1}else{x=c[w+4>>2]|0}if((x|0)!=(r|0)){x=1;break}a[v]=2;x=1;t=t+1|0;u=u-1|0}}while(0);w=w+12|0;if((w|0)==(g|0)){break b}v=v+1|0}}}while(0);if(!x){break}r=c[b>>2]|0;s=r+12|0;v=c[s>>2]|0;if((v|0)==(c[r+16>>2]|0)){A=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(A|0,r|0)|0;if(y){y=0;h=6;break a}}else{c[s>>2]=v+4}if((t+u|0)>>>0<2>>>0|o){break}r=q+1|0;s=n;v=f;while(1){do{if((a[s]|0)==2){w=d[v]|0;if((w&1|0)==0){w=w>>>1}else{w=c[v+4>>2]|0}if((w|0)==(r|0)){break}a[s]=0;t=t-1|0}}while(0);v=v+12|0;if((v|0)==(g|0)){break}else{s=s+1|0}}}}while(0);q=q+1|0}if((h|0)==5){m=Mb(-1,-1)|0;}else if((h|0)==6){m=Mb(-1,-1)|0;}else if((h|0)==82){do{if((w|0)==0){k=1;h=89}else{k=c[w+12>>2]|0;if((k|0)==(c[w+16>>2]|0)){k=(y=0,ra(c[(c[w>>2]|0)+36>>2]|0,w|0)|0);if(y){y=0;break}}else{k=c[k>>2]|0}if((k|0)==-1){c[b>>2]=0;k=1;h=89;break}else{k=(c[b>>2]|0)==0;h=89;break}}}while(0);c:do{if((h|0)==89){do{if(v){h=95}else{b=c[r+12>>2]|0;if((b|0)==(c[r+16>>2]|0)){b=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break c}}else{b=c[b>>2]|0}if((b|0)==-1){c[e>>2]=0;h=95;break}else{if(k^(r|0)==0){break}else{h=97;break}}}}while(0);if((h|0)==95){if(k){h=97}}if((h|0)==97){c[j>>2]=c[j>>2]|2}d:do{if(o){h=102}else{while(1){if((a[n]|0)==2){g=f;break d}f=f+12|0;if((f|0)==(g|0)){h=102;break d}n=n+1|0}}}while(0);if((h|0)==102){c[j>>2]=c[j>>2]|4}if((l|0)==0){i=m;return g|0}rp(l);i=m;return g|0}}while(0);m=Mb(-1,-1)|0;}if((l|0)==0){A=m;db(A|0)}rp(l);A=m;db(A|0);return 0}function kj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];lj(a,0,e,d,f,g,h);i=b;return}function lj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+144|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=e|0;F=e+104|0;n=e+112|0;o=e+128|0;z=o;v=i;i=i+4|0;i=i+7&-8;w=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==0){x=0}else if((x|0)==64){x=8}else if((x|0)==8){x=16}else{x=10}A=A|0;Hj(n,h,A,F);Pp(z|0,0,12)|0;h=o;y=0;Ha(26,o|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=o+8|0}else{B=o+8|0;I=c[B>>2]|0;C=h+1|0}c[v>>2]=I;h=w|0;c[t>>2]=h;c[u>>2]=0;f=f|0;g=g|0;E=o|0;D=o+4|0;F=c[F>>2]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;l=35;break b}}else{H=c[H>>2]|0}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){l=22}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;l=35;break b}}else{H=c[H>>2]|0}if((H|0)==-1){c[g>>2]=0;l=22;break}else{H=(G|0)==0;if(r^H){break}else{s=I;m=G;p=H;break b}}}}while(0);if((l|0)==22){l=0;if(r){s=I;m=0;p=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[v>>2]|0)-I|0)==((K?J>>>1:c[D>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[D>>2]|0;I=J}y=0;Ha(26,o|0,I<<1|0,0);if(y){y=0;l=35;break}if((a[z]&1)==0){I=10}else{I=(c[E>>2]&-2)-1|0}y=0;Ha(26,o|0,I|0,0);if(y){y=0;l=35;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[v>>2]=I+J}K=q+12|0;L=c[K>>2]|0;J=q+16|0;if((L|0)==(c[J>>2]|0)){L=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;l=35;break}}else{L=c[L>>2]|0}if((Dj(L,x,I,v,u,F,n,h,t,A)|0)!=0){s=I;m=G;p=H;break}G=c[K>>2]|0;if((G|0)==(c[J>>2]|0)){L=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(L|0,q|0)|0;if(!y){G=q;continue}else{y=0;l=35;break}}else{c[K>>2]=G+4;G=q;continue}}if((l|0)==35){L=Mb(-1,-1)|0;Yg(o);Yg(n);db(L|0)}z=d[n]|0;if((z&1|0)==0){z=z>>>1}else{z=c[n+4>>2]|0}do{if((z|0)!=0){z=c[t>>2]|0;if((z-w|0)>=160){break}L=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=L}}while(0);s=(y=0,Ka(18,s|0,c[v>>2]|0,j|0,x|0)|0);if(y){y=0;break}c[k>>2]=s;Rl(n,h,c[t>>2]|0,j);do{if(r){q=0}else{k=c[q+12>>2]|0;if((k|0)==(c[q+16>>2]|0)){k=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}}else{k=c[k>>2]|0}if((k|0)!=-1){break}c[f>>2]=0;q=0}}while(0);k=(q|0)==0;do{if(p){l=64}else{p=c[m+12>>2]|0;if((p|0)==(c[m+16>>2]|0)){p=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}}else{p=c[p>>2]|0}if((p|0)==-1){c[g>>2]=0;l=64;break}if(!(k^(m|0)==0)){break}L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}}while(0);do{if((l|0)==64){if(k){break}L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}else{y=0}}while(0);L=Mb(-1,-1)|0;Yg(o);Yg(n);db(L|0)}function mj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];nj(a,0,e,d,f,g,h);i=b;return}function nj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,M=0;o=i;i=i+144|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=o|0;F=o+104|0;e=o+112|0;n=o+128|0;z=n;w=i;i=i+4|0;i=i+7&-8;u=i;i=i+160|0;r=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==64){x=8}else if((x|0)==8){x=16}else if((x|0)==0){x=0}else{x=10}A=A|0;Hj(e,h,A,F);Pp(z|0,0,12)|0;h=n;y=0;Ha(26,n|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=n+8|0}else{B=n+8|0;I=c[B>>2]|0;C=h+1|0}c[w>>2]=I;h=u|0;c[r>>2]=h;c[v>>2]=0;f=f|0;g=g|0;E=n|0;D=n+4|0;F=c[F>>2]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=35;break b}}else{H=c[H>>2]|0}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);s=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){m=22}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=35;break b}}else{H=c[H>>2]|0}if((H|0)==-1){c[g>>2]=0;m=22;break}else{H=(G|0)==0;if(s^H){break}else{t=I;l=G;p=H;break b}}}}while(0);if((m|0)==22){m=0;if(s){t=I;l=0;p=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[w>>2]|0)-I|0)==((K?J>>>1:c[D>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[D>>2]|0;I=J}y=0;Ha(26,n|0,I<<1|0,0);if(y){y=0;m=35;break}if((a[z]&1)==0){I=10}else{I=(c[E>>2]&-2)-1|0}y=0;Ha(26,n|0,I|0,0);if(y){y=0;m=35;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[w>>2]=I+J}J=q+12|0;M=c[J>>2]|0;K=q+16|0;if((M|0)==(c[K>>2]|0)){M=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;m=35;break}}else{M=c[M>>2]|0}if((Dj(M,x,I,w,v,F,e,h,r,A)|0)!=0){t=I;l=G;p=H;break}G=c[J>>2]|0;if((G|0)==(c[K>>2]|0)){M=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(M|0,q|0)|0;if(!y){G=q;continue}else{y=0;m=35;break}}else{c[J>>2]=G+4;G=q;continue}}if((m|0)==35){M=Mb(-1,-1)|0;Yg(n);Yg(e);db(M|0)}z=d[e]|0;if((z&1|0)==0){z=z>>>1}else{z=c[e+4>>2]|0}do{if((z|0)!=0){z=c[r>>2]|0;if((z-u|0)>=160){break}M=c[v>>2]|0;c[r>>2]=z+4;c[z>>2]=M}}while(0);t=(y=0,Ka(10,t|0,c[w>>2]|0,j|0,x|0)|0);u=L;if(y){y=0;break}c[k>>2]=t;c[k+4>>2]=u;Rl(e,h,c[r>>2]|0,j);do{if(s){q=0}else{k=c[q+12>>2]|0;if((k|0)==(c[q+16>>2]|0)){k=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}}else{k=c[k>>2]|0}if((k|0)!=-1){break}c[f>>2]=0;q=0}}while(0);k=(q|0)==0;do{if(p){m=64}else{p=c[l+12>>2]|0;if((p|0)==(c[l+16>>2]|0)){p=(y=0,ra(c[(c[l>>2]|0)+36>>2]|0,l|0)|0);if(y){y=0;break a}}else{p=c[p>>2]|0}if((p|0)==-1){c[g>>2]=0;m=64;break}if(!(k^(l|0)==0)){break}M=b|0;c[M>>2]=q;Yg(n);Yg(e);i=o;return}}while(0);do{if((m|0)==64){if(k){break}M=b|0;c[M>>2]=q;Yg(n);Yg(e);i=o;return}}while(0);c[j>>2]=c[j>>2]|2;M=b|0;c[M>>2]=q;Yg(n);Yg(e);i=o;return}else{y=0}}while(0);M=Mb(-1,-1)|0;Yg(n);Yg(e);db(M|0)}function oj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];pj(a,0,e,d,f,g,h);i=b;return}function pj(e,f,g,h,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;f=i;i=i+144|0;B=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[B>>2];B=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[B>>2];B=f|0;G=f+104|0;o=f+112|0;p=f+128|0;A=p;w=i;i=i+4|0;i=i+7&-8;x=i;i=i+160|0;u=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;z=c[j+4>>2]&74;if((z|0)==0){z=0}else if((z|0)==64){z=8}else if((z|0)==8){z=16}else{z=10}B=B|0;Hj(o,j,B,G);Pp(A|0,0,12)|0;j=p;y=0;Ha(26,p|0,10,0);a:do{if(!y){if((a[A]&1)==0){D=j+1|0;J=D;C=p+8|0}else{C=p+8|0;J=c[C>>2]|0;D=j+1|0}c[w>>2]=J;j=x|0;c[u>>2]=j;c[v>>2]=0;g=g|0;h=h|0;F=p|0;E=p+4|0;G=c[G>>2]|0;H=c[g>>2]|0;b:while(1){do{if((H|0)==0){r=0}else{I=c[H+12>>2]|0;if((I|0)==(c[H+16>>2]|0)){I=(y=0,ra(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(y){y=0;m=35;break b}}else{I=c[I>>2]|0}if((I|0)!=-1){r=H;break}c[g>>2]=0;r=0}}while(0);s=(r|0)==0;H=c[h>>2]|0;do{if((H|0)==0){m=22}else{I=c[H+12>>2]|0;if((I|0)==(c[H+16>>2]|0)){I=(y=0,ra(c[(c[H>>2]|0)+36>>2]|0,H|0)|0);if(y){y=0;m=35;break b}}else{I=c[I>>2]|0}if((I|0)==-1){c[h>>2]=0;m=22;break}else{I=(H|0)==0;if(s^I){break}else{t=J;n=H;q=I;break b}}}}while(0);if((m|0)==22){m=0;if(s){t=J;n=0;q=1;break}else{H=0;I=1}}K=d[A]|0;L=(K&1|0)==0;if(((c[w>>2]|0)-J|0)==((L?K>>>1:c[E>>2]|0)|0)){if(L){J=K>>>1;K=K>>>1}else{K=c[E>>2]|0;J=K}y=0;Ha(26,p|0,J<<1|0,0);if(y){y=0;m=35;break}if((a[A]&1)==0){J=10}else{J=(c[F>>2]&-2)-1|0}y=0;Ha(26,p|0,J|0,0);if(y){y=0;m=35;break}if((a[A]&1)==0){J=D}else{J=c[C>>2]|0}c[w>>2]=J+K}L=r+12|0;M=c[L>>2]|0;K=r+16|0;if((M|0)==(c[K>>2]|0)){M=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;m=35;break}}else{M=c[M>>2]|0}if((Dj(M,z,J,w,v,G,o,j,u,B)|0)!=0){t=J;n=H;q=I;break}H=c[L>>2]|0;if((H|0)==(c[K>>2]|0)){M=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(M|0,r|0)|0;if(!y){H=r;continue}else{y=0;m=35;break}}else{c[L>>2]=H+4;H=r;continue}}if((m|0)==35){M=Mb(-1,-1)|0;Yg(p);Yg(o);db(M|0)}A=d[o]|0;if((A&1|0)==0){A=A>>>1}else{A=c[o+4>>2]|0}do{if((A|0)!=0){A=c[u>>2]|0;if((A-x|0)>=160){break}M=c[v>>2]|0;c[u>>2]=A+4;c[A>>2]=M}}while(0);t=(y=0,Ka(14,t|0,c[w>>2]|0,k|0,z|0)|0);if(y){y=0;break}b[l>>1]=t;Rl(o,j,c[u>>2]|0,k);do{if(s){r=0}else{l=c[r+12>>2]|0;if((l|0)==(c[r+16>>2]|0)){l=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break a}}else{l=c[l>>2]|0}if((l|0)!=-1){break}c[g>>2]=0;r=0}}while(0);l=(r|0)==0;do{if(q){m=64}else{q=c[n+12>>2]|0;if((q|0)==(c[n+16>>2]|0)){q=(y=0,ra(c[(c[n>>2]|0)+36>>2]|0,n|0)|0);if(y){y=0;break a}}else{q=c[q>>2]|0}if((q|0)==-1){c[h>>2]=0;m=64;break}if(!(l^(n|0)==0)){break}M=e|0;c[M>>2]=r;Yg(p);Yg(o);i=f;return}}while(0);do{if((m|0)==64){if(l){break}M=e|0;c[M>>2]=r;Yg(p);Yg(o);i=f;return}}while(0);c[k>>2]=c[k>>2]|2;M=e|0;c[M>>2]=r;Yg(p);Yg(o);i=f;return}else{y=0}}while(0);M=Mb(-1,-1)|0;Yg(p);Yg(o);db(M|0)}function qj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];rj(a,0,e,d,f,g,h);i=b;return}function rj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+144|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=e|0;F=e+104|0;n=e+112|0;o=e+128|0;z=o;v=i;i=i+4|0;i=i+7&-8;w=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==64){x=8}else if((x|0)==8){x=16}else if((x|0)==0){x=0}else{x=10}A=A|0;Hj(n,h,A,F);Pp(z|0,0,12)|0;h=o;y=0;Ha(26,o|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=o+8|0}else{B=o+8|0;I=c[B>>2]|0;C=h+1|0}c[v>>2]=I;h=w|0;c[t>>2]=h;c[u>>2]=0;f=f|0;g=g|0;E=o|0;D=o+4|0;F=c[F>>2]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;l=35;break b}}else{H=c[H>>2]|0}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){l=22}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;l=35;break b}}else{H=c[H>>2]|0}if((H|0)==-1){c[g>>2]=0;l=22;break}else{H=(G|0)==0;if(r^H){break}else{s=I;m=G;p=H;break b}}}}while(0);if((l|0)==22){l=0;if(r){s=I;m=0;p=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[v>>2]|0)-I|0)==((K?J>>>1:c[D>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[D>>2]|0;I=J}y=0;Ha(26,o|0,I<<1|0,0);if(y){y=0;l=35;break}if((a[z]&1)==0){I=10}else{I=(c[E>>2]&-2)-1|0}y=0;Ha(26,o|0,I|0,0);if(y){y=0;l=35;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[v>>2]=I+J}K=q+12|0;L=c[K>>2]|0;J=q+16|0;if((L|0)==(c[J>>2]|0)){L=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;l=35;break}}else{L=c[L>>2]|0}if((Dj(L,x,I,v,u,F,n,h,t,A)|0)!=0){s=I;m=G;p=H;break}G=c[K>>2]|0;if((G|0)==(c[J>>2]|0)){L=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(L|0,q|0)|0;if(!y){G=q;continue}else{y=0;l=35;break}}else{c[K>>2]=G+4;G=q;continue}}if((l|0)==35){L=Mb(-1,-1)|0;Yg(o);Yg(n);db(L|0)}z=d[n]|0;if((z&1|0)==0){z=z>>>1}else{z=c[n+4>>2]|0}do{if((z|0)!=0){z=c[t>>2]|0;if((z-w|0)>=160){break}L=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=L}}while(0);s=(y=0,Ka(6,s|0,c[v>>2]|0,j|0,x|0)|0);if(y){y=0;break}c[k>>2]=s;Rl(n,h,c[t>>2]|0,j);do{if(r){q=0}else{k=c[q+12>>2]|0;if((k|0)==(c[q+16>>2]|0)){k=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}}else{k=c[k>>2]|0}if((k|0)!=-1){break}c[f>>2]=0;q=0}}while(0);k=(q|0)==0;do{if(p){l=64}else{p=c[m+12>>2]|0;if((p|0)==(c[m+16>>2]|0)){p=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}}else{p=c[p>>2]|0}if((p|0)==-1){c[g>>2]=0;l=64;break}if(!(k^(m|0)==0)){break}L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}}while(0);do{if((l|0)==64){if(k){break}L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}else{y=0}}while(0);L=Mb(-1,-1)|0;Yg(o);Yg(n);db(L|0)}function sj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];tj(a,0,e,d,f,g,h);i=b;return}function tj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;e=i;i=i+144|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=e|0;F=e+104|0;n=e+112|0;o=e+128|0;z=o;v=i;i=i+4|0;i=i+7&-8;w=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==0){x=0}else if((x|0)==64){x=8}else if((x|0)==8){x=16}else{x=10}A=A|0;Hj(n,h,A,F);Pp(z|0,0,12)|0;h=o;y=0;Ha(26,o|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=o+8|0}else{B=o+8|0;I=c[B>>2]|0;C=h+1|0}c[v>>2]=I;h=w|0;c[t>>2]=h;c[u>>2]=0;f=f|0;g=g|0;E=o|0;D=o+4|0;F=c[F>>2]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;l=35;break b}}else{H=c[H>>2]|0}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);r=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){l=22}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;l=35;break b}}else{H=c[H>>2]|0}if((H|0)==-1){c[g>>2]=0;l=22;break}else{H=(G|0)==0;if(r^H){break}else{s=I;m=G;p=H;break b}}}}while(0);if((l|0)==22){l=0;if(r){s=I;m=0;p=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[v>>2]|0)-I|0)==((K?J>>>1:c[D>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[D>>2]|0;I=J}y=0;Ha(26,o|0,I<<1|0,0);if(y){y=0;l=35;break}if((a[z]&1)==0){I=10}else{I=(c[E>>2]&-2)-1|0}y=0;Ha(26,o|0,I|0,0);if(y){y=0;l=35;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[v>>2]=I+J}K=q+12|0;L=c[K>>2]|0;J=q+16|0;if((L|0)==(c[J>>2]|0)){L=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;l=35;break}}else{L=c[L>>2]|0}if((Dj(L,x,I,v,u,F,n,h,t,A)|0)!=0){s=I;m=G;p=H;break}G=c[K>>2]|0;if((G|0)==(c[J>>2]|0)){L=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(L|0,q|0)|0;if(!y){G=q;continue}else{y=0;l=35;break}}else{c[K>>2]=G+4;G=q;continue}}if((l|0)==35){L=Mb(-1,-1)|0;Yg(o);Yg(n);db(L|0)}z=d[n]|0;if((z&1|0)==0){z=z>>>1}else{z=c[n+4>>2]|0}do{if((z|0)!=0){z=c[t>>2]|0;if((z-w|0)>=160){break}L=c[u>>2]|0;c[t>>2]=z+4;c[z>>2]=L}}while(0);s=(y=0,Ka(22,s|0,c[v>>2]|0,j|0,x|0)|0);if(y){y=0;break}c[k>>2]=s;Rl(n,h,c[t>>2]|0,j);do{if(r){q=0}else{k=c[q+12>>2]|0;if((k|0)==(c[q+16>>2]|0)){k=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}}else{k=c[k>>2]|0}if((k|0)!=-1){break}c[f>>2]=0;q=0}}while(0);k=(q|0)==0;do{if(p){l=64}else{p=c[m+12>>2]|0;if((p|0)==(c[m+16>>2]|0)){p=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}}else{p=c[p>>2]|0}if((p|0)==-1){c[g>>2]=0;l=64;break}if(!(k^(m|0)==0)){break}L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}}while(0);do{if((l|0)==64){if(k){break}L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}}while(0);c[j>>2]=c[j>>2]|2;L=b|0;c[L>>2]=q;Yg(o);Yg(n);i=e;return}else{y=0}}while(0);L=Mb(-1,-1)|0;Yg(o);Yg(n);db(L|0)}function uj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];vj(a,0,e,d,f,g,h);i=b;return}function vj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,M=0;o=i;i=i+144|0;A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[A>>2];A=o|0;F=o+104|0;e=o+112|0;n=o+128|0;z=n;w=i;i=i+4|0;i=i+7&-8;u=i;i=i+160|0;r=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;x=c[h+4>>2]&74;if((x|0)==64){x=8}else if((x|0)==8){x=16}else if((x|0)==0){x=0}else{x=10}A=A|0;Hj(e,h,A,F);Pp(z|0,0,12)|0;h=n;y=0;Ha(26,n|0,10,0);a:do{if(!y){if((a[z]&1)==0){C=h+1|0;I=C;B=n+8|0}else{B=n+8|0;I=c[B>>2]|0;C=h+1|0}c[w>>2]=I;h=u|0;c[r>>2]=h;c[v>>2]=0;f=f|0;g=g|0;E=n|0;D=n+4|0;F=c[F>>2]|0;G=c[f>>2]|0;b:while(1){do{if((G|0)==0){q=0}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=35;break b}}else{H=c[H>>2]|0}if((H|0)!=-1){q=G;break}c[f>>2]=0;q=0}}while(0);s=(q|0)==0;G=c[g>>2]|0;do{if((G|0)==0){m=22}else{H=c[G+12>>2]|0;if((H|0)==(c[G+16>>2]|0)){H=(y=0,ra(c[(c[G>>2]|0)+36>>2]|0,G|0)|0);if(y){y=0;m=35;break b}}else{H=c[H>>2]|0}if((H|0)==-1){c[g>>2]=0;m=22;break}else{H=(G|0)==0;if(s^H){break}else{t=I;l=G;p=H;break b}}}}while(0);if((m|0)==22){m=0;if(s){t=I;l=0;p=1;break}else{G=0;H=1}}J=d[z]|0;K=(J&1|0)==0;if(((c[w>>2]|0)-I|0)==((K?J>>>1:c[D>>2]|0)|0)){if(K){I=J>>>1;J=J>>>1}else{J=c[D>>2]|0;I=J}y=0;Ha(26,n|0,I<<1|0,0);if(y){y=0;m=35;break}if((a[z]&1)==0){I=10}else{I=(c[E>>2]&-2)-1|0}y=0;Ha(26,n|0,I|0,0);if(y){y=0;m=35;break}if((a[z]&1)==0){I=C}else{I=c[B>>2]|0}c[w>>2]=I+J}J=q+12|0;M=c[J>>2]|0;K=q+16|0;if((M|0)==(c[K>>2]|0)){M=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;m=35;break}}else{M=c[M>>2]|0}if((Dj(M,x,I,w,v,F,e,h,r,A)|0)!=0){t=I;l=G;p=H;break}G=c[J>>2]|0;if((G|0)==(c[K>>2]|0)){M=c[(c[q>>2]|0)+40>>2]|0;y=0,ra(M|0,q|0)|0;if(!y){G=q;continue}else{y=0;m=35;break}}else{c[J>>2]=G+4;G=q;continue}}if((m|0)==35){M=Mb(-1,-1)|0;Yg(n);Yg(e);db(M|0)}z=d[e]|0;if((z&1|0)==0){z=z>>>1}else{z=c[e+4>>2]|0}do{if((z|0)!=0){z=c[r>>2]|0;if((z-u|0)>=160){break}M=c[v>>2]|0;c[r>>2]=z+4;c[z>>2]=M}}while(0);t=(y=0,Ka(30,t|0,c[w>>2]|0,j|0,x|0)|0);u=L;if(y){y=0;break}c[k>>2]=t;c[k+4>>2]=u;Rl(e,h,c[r>>2]|0,j);do{if(s){q=0}else{k=c[q+12>>2]|0;if((k|0)==(c[q+16>>2]|0)){k=(y=0,ra(c[(c[q>>2]|0)+36>>2]|0,q|0)|0);if(y){y=0;break a}}else{k=c[k>>2]|0}if((k|0)!=-1){break}c[f>>2]=0;q=0}}while(0);k=(q|0)==0;do{if(p){m=64}else{p=c[l+12>>2]|0;if((p|0)==(c[l+16>>2]|0)){p=(y=0,ra(c[(c[l>>2]|0)+36>>2]|0,l|0)|0);if(y){y=0;break a}}else{p=c[p>>2]|0}if((p|0)==-1){c[g>>2]=0;m=64;break}if(!(k^(l|0)==0)){break}M=b|0;c[M>>2]=q;Yg(n);Yg(e);i=o;return}}while(0);do{if((m|0)==64){if(k){break}M=b|0;c[M>>2]=q;Yg(n);Yg(e);i=o;return}}while(0);c[j>>2]=c[j>>2]|2;M=b|0;c[M>>2]=q;Yg(n);Yg(e);i=o;return}else{y=0}}while(0);M=Mb(-1,-1)|0;Yg(n);Yg(e);db(M|0)}function wj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];xj(a,0,e,d,f,g,h);i=b;return}function xj(b,e,f,h,j,k,l){b=b|0;e=e|0;f=f|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0;e=i;i=i+176|0;H=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[H>>2];H=h;h=i;i=i+4|0;i=i+7&-8;c[h>>2]=c[H>>2];H=e+128|0;I=e+136|0;o=e+144|0;p=e+160|0;B=p;x=i;i=i+4|0;i=i+7&-8;v=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;z=i;i=i+1|0;i=i+7&-8;A=i;i=i+1|0;i=i+7&-8;C=e|0;Ij(o,j,C,H,I);Pp(B|0,0,12)|0;j=p;y=0;Ha(26,p|0,10,0);a:do{if(!y){if((a[B]&1)==0){D=j+1|0;L=D;E=p+8|0}else{E=p+8|0;L=c[E>>2]|0;D=j+1|0}c[x>>2]=L;j=v|0;c[t>>2]=j;c[w>>2]=0;a[z]=1;a[A]=69;f=f|0;h=h|0;F=p|0;G=p+4|0;H=c[H>>2]|0;I=c[I>>2]|0;J=c[f>>2]|0;b:while(1){do{if((J|0)==0){r=0}else{K=c[J+12>>2]|0;if((K|0)==(c[J+16>>2]|0)){K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=31;break b}}else{K=c[K>>2]|0}if((K|0)!=-1){r=J;break}c[f>>2]=0;r=0}}while(0);u=(r|0)==0;J=c[h>>2]|0;do{if((J|0)==0){n=18}else{K=c[J+12>>2]|0;if((K|0)==(c[J+16>>2]|0)){K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=31;break b}}else{K=c[K>>2]|0}if((K|0)==-1){c[h>>2]=0;n=18;break}else{K=(J|0)==0;if(u^K){break}else{s=L;m=J;q=K;break b}}}}while(0);if((n|0)==18){n=0;if(u){s=L;m=0;q=1;break}else{J=0;K=1}}M=d[B]|0;N=(M&1|0)==0;if(((c[x>>2]|0)-L|0)==((N?M>>>1:c[G>>2]|0)|0)){if(N){L=M>>>1;M=M>>>1}else{M=c[G>>2]|0;L=M}y=0;Ha(26,p|0,L<<1|0,0);if(y){y=0;n=31;break}if((a[B]&1)==0){L=10}else{L=(c[F>>2]&-2)-1|0}y=0;Ha(26,p|0,L|0,0);if(y){y=0;n=31;break}if((a[B]&1)==0){L=D}else{L=c[E>>2]|0}c[x>>2]=L+M}N=r+12|0;O=c[N>>2]|0;M=r+16|0;if((O|0)==(c[M>>2]|0)){O=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;n=31;break}}else{O=c[O>>2]|0}if((Jj(O,z,A,L,x,H,I,o,j,t,w,C)|0)!=0){s=L;m=J;q=K;break}J=c[N>>2]|0;if((J|0)==(c[M>>2]|0)){O=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(O|0,r|0)|0;if(!y){J=r;continue}else{y=0;n=31;break}}else{c[N>>2]=J+4;J=r;continue}}if((n|0)==31){O=Mb(-1,-1)|0;Yg(p);Yg(o);db(O|0)}A=d[o]|0;if((A&1|0)==0){A=A>>>1}else{A=c[o+4>>2]|0}do{if((A|0)!=0){if((a[z]&1)==0){break}z=c[t>>2]|0;if((z-v|0)>=160){break}O=c[w>>2]|0;c[t>>2]=z+4;c[z>>2]=O}}while(0);P=(y=0,+(+ya(2,s|0,c[x>>2]|0,k|0)));if(y){y=0;break}g[l>>2]=P;Rl(o,j,c[t>>2]|0,k);do{if(u){r=0}else{l=c[r+12>>2]|0;if((l|0)==(c[r+16>>2]|0)){l=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break a}}else{l=c[l>>2]|0}if((l|0)!=-1){break}c[f>>2]=0;r=0}}while(0);l=(r|0)==0;do{if(q){n=61}else{q=c[m+12>>2]|0;if((q|0)==(c[m+16>>2]|0)){q=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}}else{q=c[q>>2]|0}if((q|0)==-1){c[h>>2]=0;n=61;break}if(!(l^(m|0)==0)){break}O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}}while(0);do{if((n|0)==61){if(l){break}O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}else{y=0}}while(0);O=Mb(-1,-1)|0;Yg(p);Yg(o);db(O|0)}function yj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];zj(a,0,e,d,f,g,h);i=b;return}function zj(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0;e=i;i=i+176|0;H=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[H>>2];H=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[H>>2];H=e+128|0;I=e+136|0;o=e+144|0;p=e+160|0;B=p;x=i;i=i+4|0;i=i+7&-8;v=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;z=i;i=i+1|0;i=i+7&-8;A=i;i=i+1|0;i=i+7&-8;C=e|0;Ij(o,j,C,H,I);Pp(B|0,0,12)|0;j=p;y=0;Ha(26,p|0,10,0);a:do{if(!y){if((a[B]&1)==0){D=j+1|0;L=D;E=p+8|0}else{E=p+8|0;L=c[E>>2]|0;D=j+1|0}c[x>>2]=L;j=v|0;c[t>>2]=j;c[w>>2]=0;a[z]=1;a[A]=69;f=f|0;g=g|0;F=p|0;G=p+4|0;H=c[H>>2]|0;I=c[I>>2]|0;J=c[f>>2]|0;b:while(1){do{if((J|0)==0){r=0}else{K=c[J+12>>2]|0;if((K|0)==(c[J+16>>2]|0)){K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=31;break b}}else{K=c[K>>2]|0}if((K|0)!=-1){r=J;break}c[f>>2]=0;r=0}}while(0);u=(r|0)==0;J=c[g>>2]|0;do{if((J|0)==0){n=18}else{K=c[J+12>>2]|0;if((K|0)==(c[J+16>>2]|0)){K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=31;break b}}else{K=c[K>>2]|0}if((K|0)==-1){c[g>>2]=0;n=18;break}else{K=(J|0)==0;if(u^K){break}else{s=L;m=J;q=K;break b}}}}while(0);if((n|0)==18){n=0;if(u){s=L;m=0;q=1;break}else{J=0;K=1}}M=d[B]|0;N=(M&1|0)==0;if(((c[x>>2]|0)-L|0)==((N?M>>>1:c[G>>2]|0)|0)){if(N){L=M>>>1;M=M>>>1}else{M=c[G>>2]|0;L=M}y=0;Ha(26,p|0,L<<1|0,0);if(y){y=0;n=31;break}if((a[B]&1)==0){L=10}else{L=(c[F>>2]&-2)-1|0}y=0;Ha(26,p|0,L|0,0);if(y){y=0;n=31;break}if((a[B]&1)==0){L=D}else{L=c[E>>2]|0}c[x>>2]=L+M}N=r+12|0;O=c[N>>2]|0;M=r+16|0;if((O|0)==(c[M>>2]|0)){O=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;n=31;break}}else{O=c[O>>2]|0}if((Jj(O,z,A,L,x,H,I,o,j,t,w,C)|0)!=0){s=L;m=J;q=K;break}J=c[N>>2]|0;if((J|0)==(c[M>>2]|0)){O=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(O|0,r|0)|0;if(!y){J=r;continue}else{y=0;n=31;break}}else{c[N>>2]=J+4;J=r;continue}}if((n|0)==31){O=Mb(-1,-1)|0;Yg(p);Yg(o);db(O|0)}A=d[o]|0;if((A&1|0)==0){A=A>>>1}else{A=c[o+4>>2]|0}do{if((A|0)!=0){if((a[z]&1)==0){break}z=c[t>>2]|0;if((z-v|0)>=160){break}O=c[w>>2]|0;c[t>>2]=z+4;c[z>>2]=O}}while(0);P=(y=0,+(+Ea(4,s|0,c[x>>2]|0,k|0)));if(y){y=0;break}h[l>>3]=P;Rl(o,j,c[t>>2]|0,k);do{if(u){r=0}else{l=c[r+12>>2]|0;if((l|0)==(c[r+16>>2]|0)){l=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break a}}else{l=c[l>>2]|0}if((l|0)!=-1){break}c[f>>2]=0;r=0}}while(0);l=(r|0)==0;do{if(q){n=61}else{q=c[m+12>>2]|0;if((q|0)==(c[m+16>>2]|0)){q=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}}else{q=c[q>>2]|0}if((q|0)==-1){c[g>>2]=0;n=61;break}if(!(l^(m|0)==0)){break}O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}}while(0);do{if((n|0)==61){if(l){break}O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}else{y=0}}while(0);O=Mb(-1,-1)|0;Yg(p);Yg(o);db(O|0)}function Aj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0;b=i;i=i+16|0;l=d;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[l>>2];l=e;j=i;i=i+4|0;i=i+7&-8;c[j>>2]=c[l>>2];e=b|0;d=b+8|0;c[e>>2]=c[k>>2];c[d>>2]=c[j>>2];Bj(a,0,e,d,f,g,h);i=b;return}function Bj(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0;e=i;i=i+176|0;H=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[H>>2];H=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[H>>2];H=e+128|0;I=e+136|0;o=e+144|0;p=e+160|0;B=p;x=i;i=i+4|0;i=i+7&-8;v=i;i=i+160|0;t=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;z=i;i=i+1|0;i=i+7&-8;A=i;i=i+1|0;i=i+7&-8;C=e|0;Ij(o,j,C,H,I);Pp(B|0,0,12)|0;j=p;y=0;Ha(26,p|0,10,0);a:do{if(!y){if((a[B]&1)==0){D=j+1|0;L=D;E=p+8|0}else{E=p+8|0;L=c[E>>2]|0;D=j+1|0}c[x>>2]=L;j=v|0;c[t>>2]=j;c[w>>2]=0;a[z]=1;a[A]=69;f=f|0;g=g|0;F=p|0;G=p+4|0;H=c[H>>2]|0;I=c[I>>2]|0;J=c[f>>2]|0;b:while(1){do{if((J|0)==0){r=0}else{K=c[J+12>>2]|0;if((K|0)==(c[J+16>>2]|0)){K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=31;break b}}else{K=c[K>>2]|0}if((K|0)!=-1){r=J;break}c[f>>2]=0;r=0}}while(0);u=(r|0)==0;J=c[g>>2]|0;do{if((J|0)==0){n=18}else{K=c[J+12>>2]|0;if((K|0)==(c[J+16>>2]|0)){K=(y=0,ra(c[(c[J>>2]|0)+36>>2]|0,J|0)|0);if(y){y=0;n=31;break b}}else{K=c[K>>2]|0}if((K|0)==-1){c[g>>2]=0;n=18;break}else{K=(J|0)==0;if(u^K){break}else{s=L;m=J;q=K;break b}}}}while(0);if((n|0)==18){n=0;if(u){s=L;m=0;q=1;break}else{J=0;K=1}}M=d[B]|0;N=(M&1|0)==0;if(((c[x>>2]|0)-L|0)==((N?M>>>1:c[G>>2]|0)|0)){if(N){L=M>>>1;M=M>>>1}else{M=c[G>>2]|0;L=M}y=0;Ha(26,p|0,L<<1|0,0);if(y){y=0;n=31;break}if((a[B]&1)==0){L=10}else{L=(c[F>>2]&-2)-1|0}y=0;Ha(26,p|0,L|0,0);if(y){y=0;n=31;break}if((a[B]&1)==0){L=D}else{L=c[E>>2]|0}c[x>>2]=L+M}N=r+12|0;O=c[N>>2]|0;M=r+16|0;if((O|0)==(c[M>>2]|0)){O=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;n=31;break}}else{O=c[O>>2]|0}if((Jj(O,z,A,L,x,H,I,o,j,t,w,C)|0)!=0){s=L;m=J;q=K;break}J=c[N>>2]|0;if((J|0)==(c[M>>2]|0)){O=c[(c[r>>2]|0)+40>>2]|0;y=0,ra(O|0,r|0)|0;if(!y){J=r;continue}else{y=0;n=31;break}}else{c[N>>2]=J+4;J=r;continue}}if((n|0)==31){O=Mb(-1,-1)|0;Yg(p);Yg(o);db(O|0)}A=d[o]|0;if((A&1|0)==0){A=A>>>1}else{A=c[o+4>>2]|0}do{if((A|0)!=0){if((a[z]&1)==0){break}z=c[t>>2]|0;if((z-v|0)>=160){break}O=c[w>>2]|0;c[t>>2]=z+4;c[z>>2]=O}}while(0);P=(y=0,+(+Ea(2,s|0,c[x>>2]|0,k|0)));if(y){y=0;break}h[l>>3]=P;Rl(o,j,c[t>>2]|0,k);do{if(u){r=0}else{l=c[r+12>>2]|0;if((l|0)==(c[r+16>>2]|0)){l=(y=0,ra(c[(c[r>>2]|0)+36>>2]|0,r|0)|0);if(y){y=0;break a}}else{l=c[l>>2]|0}if((l|0)!=-1){break}c[f>>2]=0;r=0}}while(0);l=(r|0)==0;do{if(q){n=61}else{q=c[m+12>>2]|0;if((q|0)==(c[m+16>>2]|0)){q=(y=0,ra(c[(c[m>>2]|0)+36>>2]|0,m|0)|0);if(y){y=0;break a}}else{q=c[q>>2]|0}if((q|0)==-1){c[g>>2]=0;n=61;break}if(!(l^(m|0)==0)){break}O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}}while(0);do{if((n|0)==61){if(l){break}O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}}while(0);c[k>>2]=c[k>>2]|2;O=b|0;c[O>>2]=r;Yg(p);Yg(o);i=e;return}else{y=0}}while(0);O=Mb(-1,-1)|0;Yg(p);Yg(o);db(O|0)}function Cj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0;n=i;i=i+136|0;t=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[t>>2];t=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[t>>2];t=n|0;s=n+16|0;m=n+120|0;u=i;i=i+4|0;i=i+7&-8;e=i;i=i+12|0;i=i+7&-8;o=i;i=i+4|0;i=i+7&-8;v=i;i=i+160|0;p=i;i=i+4|0;i=i+7&-8;r=i;i=i+4|0;i=i+7&-8;Pp(m|0,0,12)|0;q=e;y=0;qa(84,u|0,h|0);if(y){y=0;D=Mb(-1,-1)|0;Yg(m);db(D|0)}h=u|0;u=c[h>>2]|0;if((c[7714]|0)==-1){l=4}else{c[t>>2]=30856;c[t+4>>2]=18;c[t+8>>2]=0;y=0;Ha(4,30856,t|0,114);if(!y){l=4}else{y=0}}a:do{if((l|0)==4){t=(c[7715]|0)-1|0;w=c[u+8>>2]|0;do{if((c[u+12>>2]|0)-w>>2>>>0>t>>>0){t=c[w+(t<<2)>>2]|0;if((t|0)==0){break}D=t;s=s|0;C=c[(c[t>>2]|0)+48>>2]|0;y=0,Ka(C|0,D|0,27240,27266,s|0)|0;if(y){y=0;break a}xg(c[h>>2]|0)|0;Pp(q|0,0,12)|0;t=e;y=0;Ha(26,e|0,10,0);b:do{if(!y){if((a[q]&1)==0){t=t+1|0;A=t;u=e+8|0}else{u=e+8|0;A=c[u>>2]|0;t=t+1|0}c[o>>2]=A;v=v|0;c[p>>2]=v;c[r>>2]=0;f=f|0;g=g|0;x=e|0;w=e+4|0;z=c[f>>2]|0;c:while(1){do{if((z|0)==0){z=0}else{B=c[z+12>>2]|0;if((B|0)==(c[z+16>>2]|0)){B=(y=0,ra(c[(c[z>>2]|0)+36>>2]|0,z|0)|0);if(y){y=0;l=41;break c}}else{B=c[B>>2]|0}if((B|0)!=-1){break}c[f>>2]=0;z=0}}while(0);B=(z|0)==0;C=c[g>>2]|0;do{if((C|0)==0){l=26}else{D=c[C+12>>2]|0;if((D|0)==(c[C+16>>2]|0)){D=(y=0,ra(c[(c[C>>2]|0)+36>>2]|0,C|0)|0);if(y){y=0;l=41;break c}}else{D=c[D>>2]|0}if((D|0)==-1){c[g>>2]=0;l=26;break}else{if(B^(C|0)==0){break}else{break c}}}}while(0);if((l|0)==26){l=0;if(B){break}}B=d[q]|0;C=(B&1|0)==0;if(((c[o>>2]|0)-A|0)==((C?B>>>1:c[w>>2]|0)|0)){if(C){A=B>>>1;B=B>>>1}else{B=c[w>>2]|0;A=B}y=0;Ha(26,e|0,A<<1|0,0);if(y){y=0;l=41;break}if((a[q]&1)==0){A=10}else{A=(c[x>>2]&-2)-1|0}y=0;Ha(26,e|0,A|0,0);if(y){y=0;l=41;break}if((a[q]&1)==0){A=t}else{A=c[u>>2]|0}c[o>>2]=A+B}C=z+12|0;D=c[C>>2]|0;B=z+16|0;if((D|0)==(c[B>>2]|0)){D=(y=0,ra(c[(c[z>>2]|0)+36>>2]|0,z|0)|0);if(y){y=0;l=41;break}}else{D=c[D>>2]|0}if((Dj(D,16,A,o,r,0,m,v,p,s)|0)!=0){break}D=c[C>>2]|0;if((D|0)==(c[B>>2]|0)){D=c[(c[z>>2]|0)+40>>2]|0;y=0,ra(D|0,z|0)|0;if(!y){continue}else{y=0;l=41;break}}else{c[C>>2]=D+4;continue}}if((l|0)==41){j=Mb(-1,-1)|0;break}a[A+3|0]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}o=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=o;break}else{y=0;j=Mb(-1,-1)|0;break b}}}while(0);k=(y=0,Ka(32,A|0,c[7330]|0,15248,(D=i,i=i+8|0,c[D>>2]=k,D)|0)|0);i=D;if(y){y=0;l=42;break}if((k|0)!=1){c[j>>2]=4}o=c[f>>2]|0;do{if((o|0)==0){o=0}else{k=c[o+12>>2]|0;if((k|0)==(c[o+16>>2]|0)){k=(y=0,ra(c[(c[o>>2]|0)+36>>2]|0,o|0)|0);if(y){y=0;l=42;break b}}else{k=c[k>>2]|0}if((k|0)!=-1){break}c[f>>2]=0;o=0}}while(0);k=(o|0)==0;p=c[g>>2]|0;do{if((p|0)==0){l=71}else{q=c[p+12>>2]|0;if((q|0)==(c[p+16>>2]|0)){q=(y=0,ra(c[(c[p>>2]|0)+36>>2]|0,p|0)|0);if(y){y=0;l=42;break b}}else{q=c[q>>2]|0}if((q|0)==-1){c[g>>2]=0;l=71;break}if(!(k^(p|0)==0)){break}D=b|0;c[D>>2]=o;Yg(e);Yg(m);i=n;return}}while(0);do{if((l|0)==71){if(k){break}D=b|0;c[D>>2]=o;Yg(e);Yg(m);i=n;return}}while(0);c[j>>2]=c[j>>2]|2;D=b|0;c[D>>2]=o;Yg(e);Yg(m);i=n;return}else{y=0;l=42}}while(0);if((l|0)==42){j=Mb(-1,-1)|0;}Yg(e);D=j;Yg(m);db(D|0)}}while(0);D=lc(4)|0;Xo(D);y=0;Ha(16,D|0,25592,150);if(y){y=0;break}}}while(0);D=Mb(-1,-1)|0;xg(c[h>>2]|0)|0;Yg(m);db(D|0)}function Dj(b,e,f,g,h,i,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0;o=c[g>>2]|0;n=(o|0)==(f|0);do{if(n){p=(c[m+96>>2]|0)==(b|0);if(!p){if((c[m+100>>2]|0)!=(b|0)){break}}c[g>>2]=f+1;a[f]=p?43:45;c[h>>2]=0;p=0;return p|0}}while(0);p=d[j]|0;if((p&1|0)==0){j=p>>>1}else{j=c[j+4>>2]|0}if((j|0)!=0&(b|0)==(i|0)){f=c[l>>2]|0;if((f-k|0)>=160){p=0;return p|0}p=c[h>>2]|0;c[l>>2]=f+4;c[f>>2]=p;c[h>>2]=0;p=0;return p|0}l=m+104|0;k=m;while(1){i=k+4|0;if((c[k>>2]|0)==(b|0)){break}if((i|0)==(l|0)){k=l;break}else{k=i}}b=k-m|0;m=b>>2;if((b|0)>92){p=-1;return p|0}do{if((e|0)==8|(e|0)==10){if((m|0)<(e|0)){break}else{h=-1}return h|0}else if((e|0)==16){if((b|0)<88){break}if(n){p=-1;return p|0}if((o-f|0)>=3){p=-1;return p|0}if((a[o-1|0]|0)!=48){p=-1;return p|0}c[h>>2]=0;j=a[27240+m|0]|0;p=c[g>>2]|0;c[g>>2]=p+1;a[p]=j;p=0;return p|0}}while(0);p=a[27240+m|0]|0;c[g>>2]=o+1;a[o]=p;c[h>>2]=(c[h>>2]|0)+1;p=0;return p|0}function Ej(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+40|0;h=g|0;k=g+16|0;j=g+32|0;sh(j,d);d=j|0;j=c[d>>2]|0;if((c[7716]|0)==-1){l=3}else{c[k>>2]=30864;c[k+4>>2]=18;c[k+8>>2]=0;y=0;Ha(4,30864,k|0,114);if(!y){l=3}else{y=0}}a:do{if((l|0)==3){k=(c[7717]|0)-1|0;l=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-l>>2>>>0>k>>>0){j=c[l+(k<<2)>>2]|0;if((j|0)==0){break}l=j;k=c[(c[j>>2]|0)+32>>2]|0;y=0,Ka(k|0,l|0,27240,27266,e|0)|0;if(y){y=0;break a}e=c[d>>2]|0;if((c[7620]|0)!=-1){c[h>>2]=30480;c[h+4>>2]=18;c[h+8>>2]=0;y=0;Ha(4,30480,h|0,114);if(y){y=0;break a}}h=(c[7621]|0)-1|0;j=c[e+8>>2]|0;do{if((c[e+12>>2]|0)-j>>2>>>0>h>>>0){h=c[j+(h<<2)>>2]|0;if((h|0)==0){break}j=h;e=(y=0,ra(c[(c[h>>2]|0)+16>>2]|0,j|0)|0);if(y){y=0;break a}a[f]=e;y=0;qa(c[(c[h>>2]|0)+20>>2]|0,b|0,j|0);if(y){y=0;break a}xg(c[d>>2]|0)|0;i=g;return}}while(0);l=lc(4)|0;Xo(l);y=0;Ha(16,l|0,25592,150);if(y){y=0;break a}}}while(0);l=lc(4)|0;Xo(l);y=0;Ha(16,l|0,25592,150);if(y){y=0;break}}}while(0);l=Mb(-1,-1)|0;xg(c[d>>2]|0)|0;db(l|0)}function Fj(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+40|0;j=h|0;m=h+16|0;k=h+32|0;sh(k,d);d=k|0;k=c[d>>2]|0;if((c[7716]|0)==-1){l=3}else{c[m>>2]=30864;c[m+4>>2]=18;c[m+8>>2]=0;y=0;Ha(4,30864,m|0,114);if(!y){l=3}else{y=0}}a:do{if((l|0)==3){l=(c[7717]|0)-1|0;m=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-m>>2>>>0>l>>>0){k=c[m+(l<<2)>>2]|0;if((k|0)==0){break}m=k;l=c[(c[k>>2]|0)+32>>2]|0;y=0,Ka(l|0,m|0,27240,27272,e|0)|0;if(y){y=0;break a}e=c[d>>2]|0;if((c[7620]|0)!=-1){c[j>>2]=30480;c[j+4>>2]=18;c[j+8>>2]=0;y=0;Ha(4,30480,j|0,114);if(y){y=0;break a}}j=(c[7621]|0)-1|0;k=c[e+8>>2]|0;do{if((c[e+12>>2]|0)-k>>2>>>0>j>>>0){j=c[k+(j<<2)>>2]|0;if((j|0)==0){break}e=j;k=j;l=(y=0,ra(c[(c[k>>2]|0)+12>>2]|0,e|0)|0);if(y){y=0;break a}a[f]=l;f=(y=0,ra(c[(c[k>>2]|0)+16>>2]|0,e|0)|0);if(y){y=0;break a}a[g]=f;y=0;qa(c[(c[j>>2]|0)+20>>2]|0,b|0,e|0);if(y){y=0;break a}xg(c[d>>2]|0)|0;i=h;return}}while(0);m=lc(4)|0;Xo(m);y=0;Ha(16,m|0,25592,150);if(y){y=0;break a}}}while(0);m=lc(4)|0;Xo(m);y=0;Ha(16,m|0,25592,150);if(y){y=0;break}}}while(0);m=Mb(-1,-1)|0;xg(c[d>>2]|0)|0;db(m|0)}function Gj(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0;if(b<<24>>24==i<<24>>24){if((a[e]&1)==0){p=-1;return p|0}a[e]=0;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=46;h=d[k]|0;if((h&1|0)==0){h=h>>>1}else{h=c[k+4>>2]|0}if((h|0)==0){p=0;return p|0}h=c[m>>2]|0;if((h-l|0)>=160){p=0;return p|0}p=c[n>>2]|0;c[m>>2]=h+4;c[h>>2]=p;p=0;return p|0}do{if(b<<24>>24==j<<24>>24){i=d[k]|0;if((i&1|0)==0){i=i>>>1}else{i=c[k+4>>2]|0}if((i|0)==0){break}if((a[e]&1)==0){p=-1;return p|0}h=c[m>>2]|0;if((h-l|0)>=160){p=0;return p|0}p=c[n>>2]|0;c[m>>2]=h+4;c[h>>2]=p;c[n>>2]=0;p=0;return p|0}}while(0);j=o+32|0;p=o;while(1){i=p+1|0;if((a[p]|0)==b<<24>>24){j=p;break}if((i|0)==(j|0)){break}else{p=i}}b=j-o|0;if((b|0)>31){p=-1;return p|0}o=a[27240+b|0]|0;if((b|0)==25|(b|0)==24){n=c[h>>2]|0;do{if((n|0)!=(g|0)){if((a[n-1|0]&95|0)==(a[f]&127|0)){break}else{n=-1}return n|0}}while(0);c[h>>2]=n+1;a[n]=o;p=0;return p|0}else if((b|0)==22|(b|0)==23){a[f]=80;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=o;p=0;return p|0}else{g=a[f]|0;do{if((o&95|0)==(g<<24>>24|0)){a[f]=g|-128;if((a[e]&1)==0){break}a[e]=0;f=d[k]|0;if((f&1|0)==0){k=f>>>1}else{k=c[k+4>>2]|0}if((k|0)==0){break}k=c[m>>2]|0;if((k-l|0)>=160){break}p=c[n>>2]|0;c[m>>2]=k+4;c[k>>2]=p}}while(0);p=c[h>>2]|0;c[h>>2]=p+1;a[p]=o;if((b|0)>21){p=0;return p|0}c[n>>2]=(c[n>>2]|0)+1;p=0;return p|0}return 0}function Hj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;i=i+40|0;g=f|0;j=f+16|0;h=f+32|0;sh(h,b);b=h|0;h=c[b>>2]|0;if((c[7714]|0)==-1){k=3}else{c[j>>2]=30856;c[j+4>>2]=18;c[j+8>>2]=0;y=0;Ha(4,30856,j|0,114);if(!y){k=3}else{y=0}}a:do{if((k|0)==3){j=(c[7715]|0)-1|0;k=c[h+8>>2]|0;do{if((c[h+12>>2]|0)-k>>2>>>0>j>>>0){h=c[k+(j<<2)>>2]|0;if((h|0)==0){break}k=h;j=c[(c[h>>2]|0)+48>>2]|0;y=0,Ka(j|0,k|0,27240,27266,d|0)|0;if(y){y=0;break a}d=c[b>>2]|0;if((c[7618]|0)!=-1){c[g>>2]=30472;c[g+4>>2]=18;c[g+8>>2]=0;y=0;Ha(4,30472,g|0,114);if(y){y=0;break a}}g=(c[7619]|0)-1|0;h=c[d+8>>2]|0;do{if((c[d+12>>2]|0)-h>>2>>>0>g>>>0){g=c[h+(g<<2)>>2]|0;if((g|0)==0){break}h=g;d=(y=0,ra(c[(c[g>>2]|0)+16>>2]|0,h|0)|0);if(y){y=0;break a}c[e>>2]=d;y=0;qa(c[(c[g>>2]|0)+20>>2]|0,a|0,h|0);if(y){y=0;break a}xg(c[b>>2]|0)|0;i=f;return}}while(0);k=lc(4)|0;Xo(k);y=0;Ha(16,k|0,25592,150);if(y){y=0;break a}}}while(0);k=lc(4)|0;Xo(k);y=0;Ha(16,k|0,25592,150);if(y){y=0;break}}}while(0);k=Mb(-1,-1)|0;xg(c[b>>2]|0)|0;db(k|0)}function Ij(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+40|0;h=g|0;l=g+16|0;j=g+32|0;sh(j,b);b=j|0;j=c[b>>2]|0;if((c[7714]|0)==-1){k=3}else{c[l>>2]=30856;c[l+4>>2]=18;c[l+8>>2]=0;y=0;Ha(4,30856,l|0,114);if(!y){k=3}else{y=0}}a:do{if((k|0)==3){k=(c[7715]|0)-1|0;l=c[j+8>>2]|0;do{if((c[j+12>>2]|0)-l>>2>>>0>k>>>0){j=c[l+(k<<2)>>2]|0;if((j|0)==0){break}l=j;k=c[(c[j>>2]|0)+48>>2]|0;y=0,Ka(k|0,l|0,27240,27272,d|0)|0;if(y){y=0;break a}d=c[b>>2]|0;if((c[7618]|0)!=-1){c[h>>2]=30472;c[h+4>>2]=18;c[h+8>>2]=0;y=0;Ha(4,30472,h|0,114);if(y){y=0;break a}}h=(c[7619]|0)-1|0;j=c[d+8>>2]|0;do{if((c[d+12>>2]|0)-j>>2>>>0>h>>>0){h=c[j+(h<<2)>>2]|0;if((h|0)==0){break}d=h;j=h;k=(y=0,ra(c[(c[j>>2]|0)+12>>2]|0,d|0)|0);if(y){y=0;break a}c[e>>2]=k;e=(y=0,ra(c[(c[j>>2]|0)+16>>2]|0,d|0)|0);if(y){y=0;break a}c[f>>2]=e;y=0;qa(c[(c[h>>2]|0)+20>>2]|0,a|0,d|0);if(y){y=0;break a}xg(c[b>>2]|0)|0;i=g;return}}while(0);l=lc(4)|0;Xo(l);y=0;Ha(16,l|0,25592,150);if(y){y=0;break a}}}while(0);l=lc(4)|0;Xo(l);y=0;Ha(16,l|0,25592,150);if(y){y=0;break}}}while(0);l=Mb(-1,-1)|0;xg(c[b>>2]|0)|0;db(l|0)}function Jj(b,e,f,g,h,i,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0;if((b|0)==(i|0)){if((a[e]&1)==0){p=-1;return p|0}a[e]=0;p=c[h>>2]|0;c[h>>2]=p+1;a[p]=46;h=d[k]|0;if((h&1|0)==0){h=h>>>1}else{h=c[k+4>>2]|0}if((h|0)==0){p=0;return p|0}h=c[m>>2]|0;if((h-l|0)>=160){p=0;return p|0}p=c[n>>2]|0;c[m>>2]=h+4;c[h>>2]=p;p=0;return p|0}do{if((b|0)==(j|0)){i=d[k]|0;if((i&1|0)==0){i=i>>>1}else{i=c[k+4>>2]|0}if((i|0)==0){break}if((a[e]&1)==0){p=-1;return p|0}h=c[m>>2]|0;if((h-l|0)>=160){p=0;return p|0}p=c[n>>2]|0;c[m>>2]=h+4;c[h>>2]=p;c[n>>2]=0;p=0;return p|0}}while(0);j=o+128|0;p=o;while(1){i=p+4|0;if((c[p>>2]|0)==(b|0)){j=p;break}if((i|0)==(j|0)){break}else{p=i}}b=j-o|0;i=b>>2;if((b|0)>124){p=-1;return p|0}o=a[27240+i|0]|0;do{if((i|0)==25|(i|0)==24){n=c[h>>2]|0;do{if((n|0)!=(g|0)){if((a[n-1|0]&95|0)==(a[f]&127|0)){break}else{n=-1}return n|0}}while(0);c[h>>2]=n+1;a[n]=o;p=0;return p|0}else if((i|0)==22|(i|0)==23){a[f]=80}else{g=a[f]|0;if((o&95|0)!=(g<<24>>24|0)){break}a[f]=g|-128;if((a[e]&1)==0){break}a[e]=0;f=d[k]|0;if((f&1|0)==0){k=f>>>1}else{k=c[k+4>>2]|0}if((k|0)==0){break}k=c[m>>2]|0;if((k-l|0)>=160){break}p=c[n>>2]|0;c[m>>2]=k+4;c[k>>2]=p}}while(0);p=c[h>>2]|0;c[h>>2]=p+1;a[p]=o;if((b|0)>84){p=0;return p|0}c[n>>2]=(c[n>>2]|0)+1;p=0;return p|0}function Kj(a){a=a|0;vg(a|0);xp(a);return}function Lj(a){a=a|0;vg(a|0);return}function Mj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+48|0;n=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[n>>2];n=j|0;l=j+16|0;o=j+24|0;k=j+32|0;if((c[f+4>>2]&1|0)==0){q=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];Gc[q&63](b,d,l,f,g,h&1);i=j;return}sh(o,f);l=o|0;d=c[l>>2]|0;if((c[7620]|0)==-1){m=5}else{c[n>>2]=30480;c[n+4>>2]=18;c[n+8>>2]=0;y=0;Ha(4,30480,n|0,114);if(!y){m=5}else{y=0}}do{if((m|0)==5){n=(c[7621]|0)-1|0;m=c[d+8>>2]|0;do{if((c[d+12>>2]|0)-m>>2>>>0>n>>>0){n=c[m+(n<<2)>>2]|0;if((n|0)==0){break}m=n;xg(c[l>>2]|0)|0;n=c[n>>2]|0;if(h){zc[c[n+24>>2]&127](k,m)}else{zc[c[n+28>>2]&127](k,m)}m=k;h=k;g=a[h]|0;if((g&1)==0){n=m+1|0;f=n;m=k+8|0}else{q=k+8|0;f=c[q>>2]|0;n=m+1|0;m=q}e=e|0;d=k+4|0;a:while(1){if((g&1)==0){o=n}else{o=c[m>>2]|0}g=g&255;if((f|0)==(o+((g&1|0)==0?g>>>1:c[d>>2]|0)|0)){m=28;break}p=a[f]|0;o=c[e>>2]|0;do{if((o|0)!=0){q=o+24|0;g=c[q>>2]|0;if((g|0)!=(c[o+28>>2]|0)){c[q>>2]=g+1;a[g]=p;break}g=(y=0,Da(c[(c[o>>2]|0)+52>>2]|0,o|0,p&255|0)|0);if(y){y=0;m=27;break a}if((g|0)!=-1){break}c[e>>2]=0}}while(0);f=f+1|0;g=a[h]|0}if((m|0)==27){q=Mb(-1,-1)|0;Yg(k);db(q|0)}else if((m|0)==28){c[b>>2]=c[e>>2];Yg(k);i=j;return}}}while(0);q=lc(4)|0;Xo(q);y=0;Ha(16,q|0,25592,150);if(y){y=0;break}}}while(0);q=Mb(-1,-1)|0;xg(c[l>>2]|0)|0;db(q|0)}function Nj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;n=i;i=i+80|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=n|0;p=n+8|0;o=n+24|0;d=n+48|0;j=n+56|0;l=n+64|0;m=n+72|0;r=u|0;a[r]=a[19512]|0;a[r+1|0]=a[19513]|0;a[r+2|0]=a[19514]|0;a[r+3|0]=a[19515]|0;a[r+4|0]=a[19516]|0;a[r+5|0]=a[19517]|0;t=u+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[t]=43;t=u+2|0}if((s&512|0)!=0){a[t]=35;t=t+1|0}a[t]=108;t=t+1|0;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=100}}while(0);s=p|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}t=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=t;break}else{y=0;u=Mb(-1,-1)|0;db(u|0)}}}while(0);r=Oj(s,12,c[7330]|0,r,(u=i,i=i+8|0,c[u>>2]=h,u)|0)|0;i=u;h=p+r|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[s]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){p=p+1|0;break}if(!((r|0)>1&q<<24>>24==48)){k=22;break}u=a[p+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){k=22;break}p=p+2|0}else if((q|0)==32){p=h}else{k=22}}while(0);if((k|0)==22){p=s}k=o|0;sh(l,f);y=0;za(8,s|0,p|0,h|0,k|0,d|0,j|0,l|0);if(!y){xg(c[l>>2]|0)|0;c[m>>2]=c[e>>2];ud(b,m,k,c[d>>2]|0,c[j>>2]|0,f,g);i=n;return}else{y=0;u=Mb(-1,-1)|0;xg(c[l>>2]|0)|0;db(u|0)}}function Oj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g|0;j=h;c[j>>2]=f;c[j+4>>2]=0;d=_b(d|0)|0;e=$b(a|0,b|0,e|0,h|0)|0;if((d|0)==0){i=g;return e|0}y=0,ra(44,d|0)|0;if(!y){i=g;return e|0}else{y=0;j=Mb(-1,-1,0)|0;nd(j);return 0}return 0}function Pj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0;m=i;i=i+48|0;o=m|0;p=m+16|0;l=m+32|0;q=k|0;k=c[q>>2]|0;if((c[7716]|0)!=-1){c[p>>2]=30864;c[p+4>>2]=18;c[p+8>>2]=0;Sg(30864,p,114)}r=(c[7717]|0)-1|0;p=c[k+8>>2]|0;if((c[k+12>>2]|0)-p>>2>>>0<=r>>>0){z=lc(4)|0;x=z;Xo(x);Hb(z|0,25592,150)}p=c[p+(r<<2)>>2]|0;if((p|0)==0){z=lc(4)|0;x=z;Xo(x);Hb(z|0,25592,150)}k=p;q=c[q>>2]|0;if((c[7620]|0)!=-1){c[o>>2]=30480;c[o+4>>2]=18;c[o+8>>2]=0;Sg(30480,o,114)}r=(c[7621]|0)-1|0;o=c[q+8>>2]|0;if((c[q+12>>2]|0)-o>>2>>>0<=r>>>0){z=lc(4)|0;x=z;Xo(x);Hb(z|0,25592,150)}t=c[o+(r<<2)>>2]|0;if((t|0)==0){z=lc(4)|0;x=z;Xo(x);Hb(z|0,25592,150)}s=t;zc[c[(c[t>>2]|0)+20>>2]&127](l,s);r=l;o=l;q=d[o]|0;if((q&1|0)==0){q=q>>>1}else{q=c[l+4>>2]|0}a:do{if((q|0)==0){z=c[(c[p>>2]|0)+32>>2]|0;y=0,Ka(z|0,k|0,b|0,f|0,g|0)|0;if(y){y=0;n=18;break}c[j>>2]=g+(f-b)}else{c[j>>2]=g;q=a[b]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){q=(y=0,Da(c[(c[p>>2]|0)+28>>2]|0,k|0,q|0)|0);if(y){y=0;n=18;break}z=c[j>>2]|0;c[j>>2]=z+1;a[z]=q;q=b+1|0}else{q=b}do{if((f-q|0)>1){if((a[q]|0)!=48){break}w=q+1|0;z=a[w]|0;if(!((z<<24>>24|0)==120|(z<<24>>24|0)==88)){break}u=p;v=(y=0,Da(c[(c[u>>2]|0)+28>>2]|0,k|0,48)|0);if(y){y=0;n=18;break a}z=c[j>>2]|0;c[j>>2]=z+1;a[z]=v;u=(y=0,Da(c[(c[u>>2]|0)+28>>2]|0,k|0,a[w]|0)|0);if(y){y=0;n=18;break a}z=c[j>>2]|0;c[j>>2]=z+1;a[z]=u;q=q+2|0}}while(0);do{if((q|0)!=(f|0)){v=f-1|0;if(q>>>0<v>>>0){u=q}else{break}do{z=a[u]|0;a[u]=a[v]|0;a[v]=z;u=u+1|0;v=v-1|0;}while(u>>>0<v>>>0)}}while(0);s=(y=0,ra(c[(c[t>>2]|0)+16>>2]|0,s|0)|0);if(y){y=0;n=18;break}b:do{if(q>>>0<f>>>0){r=r+1|0;t=l+4|0;u=l+8|0;x=0;w=0;v=q;while(1){z=(a[o]&1)==0;do{if((a[(z?r:c[u>>2]|0)+w|0]|0)!=0){if((x|0)!=(a[(z?r:c[u>>2]|0)+w|0]|0)){break}x=c[j>>2]|0;c[j>>2]=x+1;a[x]=s;x=d[o]|0;w=(w>>>0<(((x&1|0)==0?x>>>1:c[t>>2]|0)-1|0)>>>0)+w|0;x=0}}while(0);z=(y=0,Da(c[(c[p>>2]|0)+28>>2]|0,k|0,a[v]|0)|0);if(y){y=0;break}A=c[j>>2]|0;c[j>>2]=A+1;a[A]=z;v=v+1|0;if(v>>>0<f>>>0){x=x+1|0}else{break b}}A=Mb(-1,-1)|0;Yg(l);db(A|0)}}while(0);k=g+(q-b)|0;o=c[j>>2]|0;if((k|0)==(o|0)){break}o=o-1|0;if(k>>>0>=o>>>0){break}do{A=a[k]|0;a[k]=a[o]|0;a[o]=A;k=k+1|0;o=o-1|0;}while(k>>>0<o>>>0)}}while(0);if((n|0)==18){A=Mb(-1,-1)|0;Yg(l);db(A|0)}if((e|0)==(f|0)){A=c[j>>2]|0;c[h>>2]=A;Yg(l);i=m;return}else{A=g+(e-b)|0;c[h>>2]=A;Yg(l);i=m;return}}function Qj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;o=i;i=i+112|0;s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=o|0;q=o+8|0;p=o+32|0;d=o+80|0;k=o+88|0;m=o+96|0;n=o+104|0;c[s>>2]=37;c[s+4>>2]=0;u=s+1|0;r=f+4|0;t=c[r>>2]|0;if((t&2048|0)!=0){a[u]=43;u=s+2|0}if((t&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;a[u+1|0]=108;v=u+2|0;u=t&74;do{if((u|0)==64){a[v]=111}else if((u|0)==8){if((t&16384|0)==0){a[v]=120;break}else{a[v]=88;break}}else{a[v]=100}}while(0);t=q|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}u=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=u;break}else{y=0;v=Mb(-1,-1)|0;db(v|0)}}}while(0);j=Oj(t,22,c[7330]|0,s,(v=i,i=i+16|0,c[v>>2]=h,c[v+8>>2]=j,v)|0)|0;i=v;h=q+j|0;r=c[r>>2]&176;do{if((r|0)==16){r=a[t]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){q=q+1|0;break}if(!((j|0)>1&r<<24>>24==48)){l=22;break}v=a[q+1|0]|0;if(!((v<<24>>24|0)==120|(v<<24>>24|0)==88)){l=22;break}q=q+2|0}else if((r|0)==32){q=h}else{l=22}}while(0);if((l|0)==22){q=t}l=p|0;sh(m,f);y=0;za(8,t|0,q|0,h|0,l|0,d|0,k|0,m|0);if(!y){xg(c[m>>2]|0)|0;c[n>>2]=c[e>>2];ud(b,n,l,c[d>>2]|0,c[k>>2]|0,f,g);i=o;return}else{y=0;v=Mb(-1,-1)|0;xg(c[m>>2]|0)|0;db(v|0)}}function Rj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;m=i;i=i+80|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=m|0;p=m+8|0;o=m+24|0;k=m+48|0;l=m+56|0;d=m+64|0;n=m+72|0;r=u|0;a[r]=a[19512]|0;a[r+1|0]=a[19513]|0;a[r+2|0]=a[19514]|0;a[r+3|0]=a[19515]|0;a[r+4|0]=a[19516]|0;a[r+5|0]=a[19517]|0;t=u+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[t]=43;t=u+2|0}if((s&512|0)!=0){a[t]=35;t=t+1|0}a[t]=108;t=t+1|0;u=s&74;do{if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else if((u|0)==64){a[t]=111}else{a[t]=117}}while(0);s=p|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}t=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=t;break}else{y=0;u=Mb(-1,-1)|0;db(u|0)}}}while(0);r=Oj(s,12,c[7330]|0,r,(u=i,i=i+8|0,c[u>>2]=h,u)|0)|0;i=u;h=p+r|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[s]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){p=p+1|0;break}if(!((r|0)>1&q<<24>>24==48)){j=22;break}u=a[p+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){j=22;break}p=p+2|0}else if((q|0)==32){p=h}else{j=22}}while(0);if((j|0)==22){p=s}j=o|0;sh(d,f);y=0;za(8,s|0,p|0,h|0,j|0,k|0,l|0,d|0);if(!y){xg(c[d>>2]|0)|0;c[n>>2]=c[e>>2];ud(b,n,j,c[k>>2]|0,c[l>>2]|0,f,g);i=m;return}else{y=0;u=Mb(-1,-1)|0;xg(c[d>>2]|0)|0;db(u|0)}}function Sj(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;o=i;i=i+112|0;s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=o|0;q=o+8|0;p=o+32|0;d=o+80|0;k=o+88|0;m=o+96|0;n=o+104|0;c[s>>2]=37;c[s+4>>2]=0;u=s+1|0;r=f+4|0;t=c[r>>2]|0;if((t&2048|0)!=0){a[u]=43;u=s+2|0}if((t&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;a[u+1|0]=108;v=u+2|0;u=t&74;do{if((u|0)==64){a[v]=111}else if((u|0)==8){if((t&16384|0)==0){a[v]=120;break}else{a[v]=88;break}}else{a[v]=117}}while(0);t=q|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}u=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=u;break}else{y=0;v=Mb(-1,-1)|0;db(v|0)}}}while(0);j=Oj(t,23,c[7330]|0,s,(v=i,i=i+16|0,c[v>>2]=h,c[v+8>>2]=j,v)|0)|0;i=v;h=q+j|0;r=c[r>>2]&176;do{if((r|0)==16){r=a[t]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){q=q+1|0;break}if(!((j|0)>1&r<<24>>24==48)){l=22;break}v=a[q+1|0]|0;if(!((v<<24>>24|0)==120|(v<<24>>24|0)==88)){l=22;break}q=q+2|0}else if((r|0)==32){q=h}else{l=22}}while(0);if((l|0)==22){q=t}l=p|0;sh(m,f);y=0;za(8,t|0,q|0,h|0,l|0,d|0,k|0,m|0);if(!y){xg(c[m>>2]|0)|0;c[n>>2]=c[e>>2];ud(b,n,l,c[d>>2]|0,c[k>>2]|0,f,g);i=o;return}else{y=0;v=Mb(-1,-1)|0;xg(c[m>>2]|0)|0;db(v|0)}}function Tj(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0;d=i;i=i+152|0;x=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[x>>2];x=d|0;w=d+8|0;s=d+40|0;u=d+48|0;n=d+112|0;o=d+120|0;q=d+128|0;p=d+136|0;m=d+144|0;c[x>>2]=37;c[x+4>>2]=0;A=x+1|0;v=f+4|0;B=c[v>>2]|0;if((B&2048|0)!=0){a[A]=43;A=x+2|0}if((B&1024|0)!=0){a[A]=35;A=A+1|0}z=B&260;B=B>>>14;do{if((z|0)==260){if((B&1|0)==0){a[A]=97;z=0;break}else{a[A]=65;z=0;break}}else{a[A]=46;C=A+2|0;a[A+1|0]=42;if((z|0)==4){if((B&1|0)==0){a[C]=102;z=1;break}else{a[C]=70;z=1;break}}else if((z|0)==256){if((B&1|0)==0){a[C]=101;z=1;break}else{a[C]=69;z=1;break}}else{if((B&1|0)==0){a[C]=103;z=1;break}else{a[C]=71;z=1;break}}}}while(0);w=w|0;c[s>>2]=w;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}A=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=A;break}else{y=0;C=Mb(-1,-1)|0;db(C|0)}}}while(0);A=c[7330]|0;if(z){A=Oj(w,30,A,x,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0;i=C}else{A=Oj(w,30,A,x,(C=i,i=i+8|0,h[C>>3]=j,C)|0)|0;i=C}a:do{if((A|0)>29){A=(a[31424]|0)==0;b:do{if(z){do{if(A){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=z;break}else{y=0;x=Mb(-1,-1)|0;break b}}}while(0);z=(y=0,Ka(4,s|0,c[7330]|0,x|0,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0);i=C;if(!y){l=44}else{y=0;l=36}}else{do{if(A){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=z;break}else{y=0;x=Mb(-1,-1)|0;break b}}}while(0);z=(y=0,Ka(4,s|0,c[7330]|0,x|0,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0);i=C;if(!y){l=44}else{y=0;l=36}}}while(0);do{if((l|0)==44){x=c[s>>2]|0;if((x|0)!=0){t=z;k=x;r=x;break a}y=0;Ia(4);if(y){y=0;l=36;break}r=c[s>>2]|0;t=z;k=r;break a}}while(0);if((l|0)==36){x=Mb(-1,-1)|0;}C=x;db(C|0)}else{t=A;k=0;r=c[s>>2]|0}}while(0);x=r+t|0;v=c[v>>2]&176;do{if((v|0)==16){v=a[r]|0;if((v<<24>>24|0)==45|(v<<24>>24|0)==43){v=r+1|0;break}if(!((t|0)>1&v<<24>>24==48)){l=53;break}C=a[r+1|0]|0;if(!((C<<24>>24|0)==120|(C<<24>>24|0)==88)){l=53;break}v=r+2|0}else if((v|0)==32){v=x}else{l=53}}while(0);if((l|0)==53){v=r}do{if((r|0)==(w|0)){t=u|0;u=0;r=w;l=59}else{l=qp(t<<1)|0;if((l|0)!=0){t=l;u=l;l=59;break}y=0;Ia(4);if(y){y=0;u=0;l=58;break}t=0;u=0;r=c[s>>2]|0;l=59}}while(0);do{if((l|0)==59){y=0;qa(84,q|0,f|0);if(y){y=0;l=58;break}y=0;za(22,r|0,v|0,x|0,t|0,n|0,o|0,q|0);if(y){y=0;f=Mb(-1,-1)|0;xg(c[q>>2]|0)|0;break}xg(c[q>>2]|0)|0;l=e|0;c[m>>2]=c[l>>2];y=0;za(46,p|0,m|0,t|0,c[n>>2]|0,c[o>>2]|0,f|0,g|0);if(y){y=0;l=58;break}C=c[p>>2]|0;c[l>>2]=C;c[b>>2]=C;if((u|0)!=0){rp(u)}if((k|0)==0){i=d;return}rp(k);i=d;return}}while(0);if((l|0)==58){f=Mb(-1,-1)|0;}if((u|0)!=0){rp(u)}if((k|0)==0){C=f;db(C|0)}rp(k);C=f;db(C|0)}function Uj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;b=_b(b|0)|0;d=(y=0,ta(66,a|0,d|0,g|0)|0);if(!y){if((b|0)==0){i=f;return d|0}y=0,ra(44,b|0)|0;if(!y){i=f;return d|0}else{y=0;h=Mb(-1,-1,0)|0;nd(h);return 0}}else{y=0;f=Mb(-1,-1)|0;if((b|0)==0){db(f|0)}y=0,ra(44,b|0)|0;if(!y){db(f|0)}else{y=0;h=Mb(-1,-1,0)|0;nd(h);return 0}}return 0}function Vj(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+48|0;r=m|0;p=m+16|0;l=m+32|0;s=k|0;k=c[s>>2]|0;if((c[7716]|0)!=-1){c[p>>2]=30864;c[p+4>>2]=18;c[p+8>>2]=0;Sg(30864,p,114)}t=(c[7717]|0)-1|0;p=c[k+8>>2]|0;if((c[k+12>>2]|0)-p>>2>>>0<=t>>>0){E=lc(4)|0;D=E;Xo(D);Hb(E|0,25592,150)}p=c[p+(t<<2)>>2]|0;if((p|0)==0){E=lc(4)|0;D=E;Xo(D);Hb(E|0,25592,150)}k=p;s=c[s>>2]|0;if((c[7620]|0)!=-1){c[r>>2]=30480;c[r+4>>2]=18;c[r+8>>2]=0;Sg(30480,r,114)}r=(c[7621]|0)-1|0;t=c[s+8>>2]|0;if((c[s+12>>2]|0)-t>>2>>>0<=r>>>0){E=lc(4)|0;D=E;Xo(D);Hb(E|0,25592,150)}r=c[t+(r<<2)>>2]|0;if((r|0)==0){E=lc(4)|0;D=E;Xo(D);Hb(E|0,25592,150)}s=r;zc[c[(c[r>>2]|0)+20>>2]&127](l,s);c[j>>2]=g;t=a[b]|0;do{if((t<<24>>24|0)==45|(t<<24>>24|0)==43){t=(y=0,Da(c[(c[p>>2]|0)+28>>2]|0,k|0,t|0)|0);if(y){y=0;break}v=c[j>>2]|0;c[j>>2]=v+1;a[v]=t;v=b+1|0;u=20}else{v=b;u=20}}while(0);a:do{if((u|0)==20){t=f;b:do{if((t-v|0)>1){if((a[v]|0)!=48){u=21;break}x=v+1|0;E=a[x]|0;if(!((E<<24>>24|0)==120|(E<<24>>24|0)==88)){u=21;break}w=p;z=(y=0,Da(c[(c[w>>2]|0)+28>>2]|0,k|0,48)|0);if(y){y=0;break a}E=c[j>>2]|0;c[j>>2]=E+1;a[E]=z;v=v+2|0;w=(y=0,Da(c[(c[w>>2]|0)+28>>2]|0,k|0,a[x]|0)|0);if(y){y=0;break a}E=c[j>>2]|0;c[j>>2]=E+1;a[E]=w;if(v>>>0<f>>>0){w=v}else{o=v;q=v;break}c:while(1){x=a[w]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(y){y=0;u=32;break c}c[7330]=z}}while(0);x=(y=0,Da(62,x<<24>>24|0,c[7330]|0)|0);if(y){y=0;u=17;break}z=w+1|0;if((x|0)==0){o=w;q=v;break b}if(z>>>0<f>>>0){w=z}else{o=z;q=v;break b}}if((u|0)==17){E=Mb(-1,-1)|0;Yg(l);db(E|0)}else if((u|0)==32){E=Mb(-1,-1)|0;Yg(l);db(E|0)}}else{u=21}}while(0);d:do{if((u|0)==21){if(v>>>0<f>>>0){u=v}else{o=v;q=v;break}e:while(1){x=a[u]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}w=(y=0,ta(8,2147483647,16448,0)|0);if(y){y=0;u=40;break e}c[7330]=w}}while(0);w=(y=0,Da(26,x<<24>>24|0,c[7330]|0)|0);if(y){y=0;u=16;break}x=u+1|0;if((w|0)==0){o=u;q=v;break d}if(x>>>0<f>>>0){u=x}else{o=x;q=v;break d}}if((u|0)==16){E=Mb(-1,-1)|0;Yg(l);db(E|0)}else if((u|0)==40){E=Mb(-1,-1)|0;Yg(l);db(E|0)}}}while(0);w=l;u=l;v=d[u]|0;if((v&1|0)==0){v=v>>>1}else{v=c[l+4>>2]|0}do{if((v|0)==0){E=c[j>>2]|0;D=c[(c[p>>2]|0)+32>>2]|0;y=0,Ka(D|0,k|0,q|0,o|0,E|0)|0;if(y){y=0;break a}c[j>>2]=(c[j>>2]|0)+(o-q)}else{do{if((q|0)!=(o|0)){x=o-1|0;if(q>>>0<x>>>0){v=q}else{break}do{E=a[v]|0;a[v]=a[x]|0;a[x]=E;v=v+1|0;x=x-1|0;}while(v>>>0<x>>>0)}}while(0);v=(y=0,ra(c[(c[r>>2]|0)+16>>2]|0,s|0)|0);if(y){y=0;break a}f:do{if(q>>>0<o>>>0){x=w+1|0;A=l+4|0;w=l+8|0;z=p;C=0;D=0;B=q;while(1){E=(a[u]&1)==0;do{if((a[(E?x:c[w>>2]|0)+D|0]|0)>0){if((C|0)!=(a[(E?x:c[w>>2]|0)+D|0]|0)){break}C=c[j>>2]|0;c[j>>2]=C+1;a[C]=v;C=d[u]|0;D=(D>>>0<(((C&1|0)==0?C>>>1:c[A>>2]|0)-1|0)>>>0)+D|0;C=0}}while(0);E=(y=0,Da(c[(c[z>>2]|0)+28>>2]|0,k|0,a[B]|0)|0);if(y){y=0;break}F=c[j>>2]|0;c[j>>2]=F+1;a[F]=E;B=B+1|0;if(B>>>0<o>>>0){C=C+1|0}else{break f}}F=Mb(-1,-1)|0;Yg(l);db(F|0)}}while(0);u=g+(q-b)|0;q=c[j>>2]|0;if((u|0)==(q|0)){break}q=q-1|0;if(u>>>0>=q>>>0){break}do{F=a[u]|0;a[u]=a[q]|0;a[q]=F;u=u+1|0;q=q-1|0;}while(u>>>0<q>>>0)}}while(0);g:do{if(o>>>0<f>>>0){q=p;while(1){u=a[o]|0;if(u<<24>>24==46){u=66;break}u=(y=0,Da(c[(c[q>>2]|0)+28>>2]|0,k|0,u|0)|0);if(y){y=0;u=14;break}F=c[j>>2]|0;c[j>>2]=F+1;a[F]=u;o=o+1|0;if(o>>>0>=f>>>0){n=o;break g}}if((u|0)==14){F=Mb(-1,-1)|0;Yg(l);db(F|0)}else if((u|0)==66){n=(y=0,ra(c[(c[r>>2]|0)+12>>2]|0,s|0)|0);if(y){y=0;break a}F=c[j>>2]|0;c[j>>2]=F+1;a[F]=n;n=o+1|0;break}}else{n=o}}while(0);F=c[j>>2]|0;E=c[(c[p>>2]|0)+32>>2]|0;y=0,Ka(E|0,k|0,n|0,f|0,F|0)|0;if(y){y=0;break}n=(c[j>>2]|0)+(t-n)|0;c[j>>2]=n;if((e|0)==(f|0)){F=n;c[h>>2]=F;Yg(l);i=m;return}F=g+(e-b)|0;c[h>>2]=F;Yg(l);i=m;return}}while(0);F=Mb(-1,-1)|0;Yg(l);db(F|0)}function Wj(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0;d=i;i=i+152|0;x=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[x>>2];x=d|0;w=d+8|0;s=d+40|0;u=d+48|0;o=d+112|0;p=d+120|0;q=d+128|0;m=d+136|0;n=d+144|0;c[x>>2]=37;c[x+4>>2]=0;B=x+1|0;v=f+4|0;z=c[v>>2]|0;if((z&2048|0)!=0){a[B]=43;B=x+2|0}if((z&1024|0)!=0){a[B]=35;B=B+1|0}A=z&260;z=z>>>14;do{if((A|0)==260){a[B]=76;A=B+1|0;if((z&1|0)==0){a[A]=97;z=0;break}else{a[A]=65;z=0;break}}else{a[B]=46;a[B+1|0]=42;a[B+2|0]=76;B=B+3|0;if((A|0)==256){if((z&1|0)==0){a[B]=101;z=1;break}else{a[B]=69;z=1;break}}else if((A|0)==4){if((z&1|0)==0){a[B]=102;z=1;break}else{a[B]=70;z=1;break}}else{if((z&1|0)==0){a[B]=103;z=1;break}else{a[B]=71;z=1;break}}}}while(0);w=w|0;c[s>>2]=w;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}A=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=A;break}else{y=0;B=Mb(-1,-1)|0;db(B|0)}}}while(0);A=c[7330]|0;if(z){A=Oj(w,30,A,x,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0;i=B}else{A=Oj(w,30,A,x,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0;i=B}a:do{if((A|0)>29){A=(a[31424]|0)==0;b:do{if(z){do{if(A){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=z;break}else{y=0;x=Mb(-1,-1)|0;break b}}}while(0);z=(y=0,Ka(4,s|0,c[7330]|0,x|0,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0);i=B;if(!y){l=44}else{y=0;l=36}}else{do{if(A){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=z;break}else{y=0;x=Mb(-1,-1)|0;break b}}}while(0);z=(y=0,Ka(4,s|0,c[7330]|0,x|0,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0);i=B;if(!y){l=44}else{y=0;l=36}}}while(0);do{if((l|0)==44){x=c[s>>2]|0;if((x|0)!=0){t=z;k=x;r=x;break a}y=0;Ia(4);if(y){y=0;l=36;break}r=c[s>>2]|0;t=z;k=r;break a}}while(0);if((l|0)==36){x=Mb(-1,-1)|0;}B=x;db(B|0)}else{t=A;k=0;r=c[s>>2]|0}}while(0);x=r+t|0;v=c[v>>2]&176;do{if((v|0)==16){v=a[r]|0;if((v<<24>>24|0)==45|(v<<24>>24|0)==43){v=r+1|0;break}if(!((t|0)>1&v<<24>>24==48)){l=53;break}B=a[r+1|0]|0;if(!((B<<24>>24|0)==120|(B<<24>>24|0)==88)){l=53;break}v=r+2|0}else if((v|0)==32){v=x}else{l=53}}while(0);if((l|0)==53){v=r}do{if((r|0)==(w|0)){u=u|0;t=0;r=w;l=59}else{l=qp(t<<1)|0;if((l|0)!=0){u=l;t=l;l=59;break}y=0;Ia(4);if(y){y=0;t=0;l=58;break}u=0;t=0;r=c[s>>2]|0;l=59}}while(0);do{if((l|0)==59){y=0;qa(84,q|0,f|0);if(y){y=0;l=58;break}y=0;za(22,r|0,v|0,x|0,u|0,o|0,p|0,q|0);if(y){y=0;f=Mb(-1,-1)|0;xg(c[q>>2]|0)|0;break}xg(c[q>>2]|0)|0;e=e|0;c[n>>2]=c[e>>2];y=0;za(46,m|0,n|0,u|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(y){y=0;l=58;break}B=c[m>>2]|0;c[e>>2]=B;c[b>>2]=B;if((t|0)!=0){rp(t)}if((k|0)==0){i=d;return}rp(k);i=d;return}}while(0);if((l|0)==58){f=Mb(-1,-1)|0;}if((t|0)!=0){rp(t)}if((k|0)==0){B=f;db(B|0)}rp(k);B=f;db(B|0)}function Xj(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;j=i;i=i+104|0;o=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[o>>2];o=j|0;k=j+24|0;d=j+48|0;r=j+88|0;l=j+96|0;n=j+16|0;a[n]=a[19520]|0;a[n+1|0]=a[19521]|0;a[n+2|0]=a[19522]|0;a[n+3|0]=a[19523]|0;a[n+4|0]=a[19524]|0;a[n+5|0]=a[19525]|0;m=k|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}p=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=p;break}else{y=0;s=Mb(-1,-1)|0;db(s|0)}}}while(0);n=Oj(m,20,c[7330]|0,n,(p=i,i=i+8|0,c[p>>2]=h,p)|0)|0;i=p;h=k+n|0;p=c[f+4>>2]&176;do{if((p|0)==32){p=h}else if((p|0)==16){p=a[m]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){p=k+1|0;break}if(!((n|0)>1&p<<24>>24==48)){q=12;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){q=12;break}p=k+2|0}else{q=12}}while(0);if((q|0)==12){p=m}sh(r,f);q=r|0;r=c[q>>2]|0;do{if((c[7716]|0)!=-1){c[o>>2]=30864;c[o+4>>2]=18;c[o+8>>2]=0;y=0;Ha(4,30864,o|0,114);if(!y){break}else{y=0}s=Mb(-1,-1)|0;o=c[q>>2]|0;o=o|0;xg(o)|0;db(s|0)}}while(0);o=(c[7717]|0)-1|0;s=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-s>>2>>>0>o>>>0){r=c[s+(o<<2)>>2]|0;if((r|0)==0){break}xg(c[q>>2]|0)|0;o=d|0;Tc[c[(c[r>>2]|0)+32>>2]&63](r,m,h,o)|0;m=d+n|0;if((p|0)==(h|0)){s=m;q=e|0;q=c[q>>2]|0;r=l|0;c[r>>2]=q;ud(b,l,o,s,m,f,g);i=j;return}s=d+(p-k)|0;q=e|0;q=c[q>>2]|0;r=l|0;c[r>>2]=q;ud(b,l,o,s,m,f,g);i=j;return}}while(0);s=lc(4)|0;Xo(s);y=0;Ha(16,s|0,25592,150);if(y){y=0;s=Mb(-1,-1)|0;r=c[q>>2]|0;r=r|0;xg(r)|0;db(s|0)}}function Yj(a){a=a|0;vg(a|0);xp(a);return}function Zj(a){a=a|0;vg(a|0);return}function _j(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;i=i+48|0;n=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[n>>2];n=j|0;l=j+16|0;o=j+24|0;k=j+32|0;if((c[f+4>>2]&1|0)==0){p=c[(c[d>>2]|0)+24>>2]|0;c[l>>2]=c[e>>2];Gc[p&63](b,d,l,f,g,h&1);i=j;return}sh(o,f);l=o|0;o=c[l>>2]|0;if((c[7618]|0)==-1){m=5}else{c[n>>2]=30472;c[n+4>>2]=18;c[n+8>>2]=0;y=0;Ha(4,30472,n|0,114);if(!y){m=5}else{y=0}}do{if((m|0)==5){n=(c[7619]|0)-1|0;m=c[o+8>>2]|0;do{if((c[o+12>>2]|0)-m>>2>>>0>n>>>0){n=c[m+(n<<2)>>2]|0;if((n|0)==0){break}m=n;xg(c[l>>2]|0)|0;n=c[n>>2]|0;if(h){zc[c[n+24>>2]&127](k,m)}else{zc[c[n+28>>2]&127](k,m)}n=k;d=a[n]|0;if((d&1)==0){m=k+4|0;o=m;h=k+8|0}else{h=k+8|0;o=c[h>>2]|0;m=k+4|0}e=e|0;f=d;a:while(1){if((f&1)==0){d=m}else{d=c[h>>2]|0}f=f&255;if((f&1|0)==0){f=f>>>1}else{f=c[m>>2]|0}if((o|0)==(d+(f<<2)|0)){m=31;break}g=c[o>>2]|0;f=c[e>>2]|0;do{if((f|0)!=0){d=f+24|0;p=c[d>>2]|0;if((p|0)==(c[f+28>>2]|0)){g=(y=0,Da(c[(c[f>>2]|0)+52>>2]|0,f|0,g|0)|0);if(y){y=0;m=30;break a}}else{c[d>>2]=p+4;c[p>>2]=g}if((g|0)!=-1){break}c[e>>2]=0}}while(0);o=o+4|0;f=a[n]|0}if((m|0)==30){p=Mb(-1,-1)|0;jh(k);db(p|0)}else if((m|0)==31){c[b>>2]=c[e>>2];jh(k);i=j;return}}}while(0);p=lc(4)|0;Xo(p);y=0;Ha(16,p|0,25592,150);if(y){y=0;break}}}while(0);p=Mb(-1,-1)|0;xg(c[l>>2]|0)|0;db(p|0)}function $j(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;n=i;i=i+144|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=n|0;p=n+8|0;o=n+24|0;d=n+112|0;j=n+120|0;l=n+128|0;m=n+136|0;r=u|0;a[r]=a[19512]|0;a[r+1|0]=a[19513]|0;a[r+2|0]=a[19514]|0;a[r+3|0]=a[19515]|0;a[r+4|0]=a[19516]|0;a[r+5|0]=a[19517]|0;t=u+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[t]=43;t=u+2|0}if((s&512|0)!=0){a[t]=35;t=t+1|0}a[t]=108;t=t+1|0;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=100}}while(0);s=p|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}t=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=t;break}else{y=0;u=Mb(-1,-1)|0;db(u|0)}}}while(0);r=Oj(s,12,c[7330]|0,r,(u=i,i=i+8|0,c[u>>2]=h,u)|0)|0;i=u;h=p+r|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[s]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){p=p+1|0;break}if(!((r|0)>1&q<<24>>24==48)){k=22;break}u=a[p+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){k=22;break}p=p+2|0}else if((q|0)==32){p=h}else{k=22}}while(0);if((k|0)==22){p=s}k=o|0;sh(l,f);y=0;za(20,s|0,p|0,h|0,k|0,d|0,j|0,l|0);if(!y){xg(c[l>>2]|0)|0;c[m>>2]=c[e>>2];bk(b,m,k,c[d>>2]|0,c[j>>2]|0,f,g);i=n;return}else{y=0;u=Mb(-1,-1)|0;xg(c[l>>2]|0)|0;db(u|0)}}function ak(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0;m=i;i=i+48|0;o=m|0;p=m+16|0;l=m+32|0;q=k|0;k=c[q>>2]|0;if((c[7714]|0)!=-1){c[p>>2]=30856;c[p+4>>2]=18;c[p+8>>2]=0;Sg(30856,p,114)}r=(c[7715]|0)-1|0;p=c[k+8>>2]|0;if((c[k+12>>2]|0)-p>>2>>>0<=r>>>0){z=lc(4)|0;x=z;Xo(x);Hb(z|0,25592,150)}p=c[p+(r<<2)>>2]|0;if((p|0)==0){z=lc(4)|0;x=z;Xo(x);Hb(z|0,25592,150)}k=p;q=c[q>>2]|0;if((c[7618]|0)!=-1){c[o>>2]=30472;c[o+4>>2]=18;c[o+8>>2]=0;Sg(30472,o,114)}r=(c[7619]|0)-1|0;o=c[q+8>>2]|0;if((c[q+12>>2]|0)-o>>2>>>0<=r>>>0){z=lc(4)|0;x=z;Xo(x);Hb(z|0,25592,150)}t=c[o+(r<<2)>>2]|0;if((t|0)==0){z=lc(4)|0;x=z;Xo(x);Hb(z|0,25592,150)}s=t;zc[c[(c[t>>2]|0)+20>>2]&127](l,s);r=l;o=l;q=d[o]|0;if((q&1|0)==0){q=q>>>1}else{q=c[l+4>>2]|0}a:do{if((q|0)==0){z=c[(c[p>>2]|0)+48>>2]|0;y=0,Ka(z|0,k|0,b|0,f|0,g|0)|0;if(y){y=0;n=18;break}c[j>>2]=g+(f-b<<2)}else{c[j>>2]=g;q=a[b]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){q=(y=0,Da(c[(c[p>>2]|0)+44>>2]|0,k|0,q|0)|0);if(y){y=0;n=18;break}z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=q;q=b+1|0}else{q=b}do{if((f-q|0)>1){if((a[q]|0)!=48){break}w=q+1|0;z=a[w]|0;if(!((z<<24>>24|0)==120|(z<<24>>24|0)==88)){break}u=p;v=(y=0,Da(c[(c[u>>2]|0)+44>>2]|0,k|0,48)|0);if(y){y=0;n=18;break a}z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=v;u=(y=0,Da(c[(c[u>>2]|0)+44>>2]|0,k|0,a[w]|0)|0);if(y){y=0;n=18;break a}z=c[j>>2]|0;c[j>>2]=z+4;c[z>>2]=u;q=q+2|0}}while(0);do{if((q|0)!=(f|0)){v=f-1|0;if(q>>>0<v>>>0){u=q}else{break}do{z=a[u]|0;a[u]=a[v]|0;a[v]=z;u=u+1|0;v=v-1|0;}while(u>>>0<v>>>0)}}while(0);s=(y=0,ra(c[(c[t>>2]|0)+16>>2]|0,s|0)|0);if(y){y=0;n=18;break}b:do{if(q>>>0<f>>>0){r=r+1|0;t=l+4|0;u=l+8|0;x=0;w=0;v=q;while(1){z=(a[o]&1)==0;do{if((a[(z?r:c[u>>2]|0)+w|0]|0)!=0){if((x|0)!=(a[(z?r:c[u>>2]|0)+w|0]|0)){break}x=c[j>>2]|0;c[j>>2]=x+4;c[x>>2]=s;x=d[o]|0;w=(w>>>0<(((x&1|0)==0?x>>>1:c[t>>2]|0)-1|0)>>>0)+w|0;x=0}}while(0);z=(y=0,Da(c[(c[p>>2]|0)+44>>2]|0,k|0,a[v]|0)|0);if(y){y=0;break}A=c[j>>2]|0;c[j>>2]=A+4;c[A>>2]=z;v=v+1|0;if(v>>>0<f>>>0){x=x+1|0}else{break b}}A=Mb(-1,-1)|0;Yg(l);db(A|0)}}while(0);k=g+(q-b<<2)|0;o=c[j>>2]|0;if((k|0)==(o|0)){break}o=o-4|0;if(k>>>0>=o>>>0){break}do{A=c[k>>2]|0;c[k>>2]=c[o>>2];c[o>>2]=A;k=k+4|0;o=o-4|0;}while(k>>>0<o>>>0)}}while(0);if((n|0)==18){A=Mb(-1,-1)|0;Yg(l);db(A|0)}if((e|0)==(f|0)){A=c[j>>2]|0;c[h>>2]=A;Yg(l);i=m;return}else{A=g+(e-b<<2)|0;c[h>>2]=A;Yg(l);i=m;return}}function bk(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;i=i+16|0;m=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[m>>2];m=k|0;d=d|0;l=c[d>>2]|0;if((l|0)==0){c[b>>2]=0;i=k;return}o=e;n=g-o>>2;h=h+12|0;p=c[h>>2]|0;p=(p|0)>(n|0)?p-n|0:0;n=f;q=n-o|0;o=q>>2;do{if((q|0)>0){if((Cc[c[(c[l>>2]|0)+48>>2]&127](l,e,o)|0)==(o|0)){break}c[d>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((p|0)>0){ih(m,p,j);if((a[m]&1)==0){j=m+4|0}else{j=c[m+8>>2]|0}j=(y=0,ta(c[(c[l>>2]|0)+48>>2]|0,l|0,j|0,p|0)|0);if(y){y=0;q=Mb(-1,-1)|0;jh(m);db(q|0)}if((j|0)==(p|0)){jh(m);break}c[d>>2]=0;c[b>>2]=0;jh(m);i=k;return}}while(0);q=g-n|0;m=q>>2;do{if((q|0)>0){if((Cc[c[(c[l>>2]|0)+48>>2]&127](l,f,m)|0)==(m|0)){break}c[d>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[h>>2]=0;c[b>>2]=l;i=k;return}function ck(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;o=i;i=i+232|0;s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=o|0;q=o+8|0;p=o+32|0;d=o+200|0;k=o+208|0;m=o+216|0;n=o+224|0;c[s>>2]=37;c[s+4>>2]=0;u=s+1|0;r=f+4|0;t=c[r>>2]|0;if((t&2048|0)!=0){a[u]=43;u=s+2|0}if((t&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;a[u+1|0]=108;v=u+2|0;u=t&74;do{if((u|0)==64){a[v]=111}else if((u|0)==8){if((t&16384|0)==0){a[v]=120;break}else{a[v]=88;break}}else{a[v]=100}}while(0);t=q|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}u=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=u;break}else{y=0;v=Mb(-1,-1)|0;db(v|0)}}}while(0);j=Oj(t,22,c[7330]|0,s,(v=i,i=i+16|0,c[v>>2]=h,c[v+8>>2]=j,v)|0)|0;i=v;h=q+j|0;r=c[r>>2]&176;do{if((r|0)==16){r=a[t]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){q=q+1|0;break}if(!((j|0)>1&r<<24>>24==48)){l=22;break}v=a[q+1|0]|0;if(!((v<<24>>24|0)==120|(v<<24>>24|0)==88)){l=22;break}q=q+2|0}else if((r|0)==32){q=h}else{l=22}}while(0);if((l|0)==22){q=t}l=p|0;sh(m,f);y=0;za(20,t|0,q|0,h|0,l|0,d|0,k|0,m|0);if(!y){xg(c[m>>2]|0)|0;c[n>>2]=c[e>>2];bk(b,n,l,c[d>>2]|0,c[k>>2]|0,f,g);i=o;return}else{y=0;v=Mb(-1,-1)|0;xg(c[m>>2]|0)|0;db(v|0)}}function dk(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;n=i;i=i+144|0;u=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[u>>2];u=n|0;p=n+8|0;o=n+24|0;d=n+112|0;j=n+120|0;l=n+128|0;m=n+136|0;r=u|0;a[r]=a[19512]|0;a[r+1|0]=a[19513]|0;a[r+2|0]=a[19514]|0;a[r+3|0]=a[19515]|0;a[r+4|0]=a[19516]|0;a[r+5|0]=a[19517]|0;t=u+1|0;q=f+4|0;s=c[q>>2]|0;if((s&2048|0)!=0){a[t]=43;t=u+2|0}if((s&512|0)!=0){a[t]=35;t=t+1|0}a[t]=108;t=t+1|0;u=s&74;do{if((u|0)==64){a[t]=111}else if((u|0)==8){if((s&16384|0)==0){a[t]=120;break}else{a[t]=88;break}}else{a[t]=117}}while(0);s=p|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}t=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=t;break}else{y=0;u=Mb(-1,-1)|0;db(u|0)}}}while(0);r=Oj(s,12,c[7330]|0,r,(u=i,i=i+8|0,c[u>>2]=h,u)|0)|0;i=u;h=p+r|0;q=c[q>>2]&176;do{if((q|0)==16){q=a[s]|0;if((q<<24>>24|0)==45|(q<<24>>24|0)==43){p=p+1|0;break}if(!((r|0)>1&q<<24>>24==48)){k=22;break}u=a[p+1|0]|0;if(!((u<<24>>24|0)==120|(u<<24>>24|0)==88)){k=22;break}p=p+2|0}else if((q|0)==32){p=h}else{k=22}}while(0);if((k|0)==22){p=s}k=o|0;sh(l,f);y=0;za(20,s|0,p|0,h|0,k|0,d|0,j|0,l|0);if(!y){xg(c[l>>2]|0)|0;c[m>>2]=c[e>>2];bk(b,m,k,c[d>>2]|0,c[j>>2]|0,f,g);i=n;return}else{y=0;u=Mb(-1,-1)|0;xg(c[l>>2]|0)|0;db(u|0)}}function ek(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;o=i;i=i+240|0;s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=o|0;q=o+8|0;p=o+32|0;d=o+208|0;k=o+216|0;m=o+224|0;n=o+232|0;c[s>>2]=37;c[s+4>>2]=0;u=s+1|0;r=f+4|0;t=c[r>>2]|0;if((t&2048|0)!=0){a[u]=43;u=s+2|0}if((t&512|0)!=0){a[u]=35;u=u+1|0}a[u]=108;a[u+1|0]=108;v=u+2|0;u=t&74;do{if((u|0)==64){a[v]=111}else if((u|0)==8){if((t&16384|0)==0){a[v]=120;break}else{a[v]=88;break}}else{a[v]=117}}while(0);t=q|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}u=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=u;break}else{y=0;v=Mb(-1,-1)|0;db(v|0)}}}while(0);j=Oj(t,23,c[7330]|0,s,(v=i,i=i+16|0,c[v>>2]=h,c[v+8>>2]=j,v)|0)|0;i=v;h=q+j|0;r=c[r>>2]&176;do{if((r|0)==16){r=a[t]|0;if((r<<24>>24|0)==45|(r<<24>>24|0)==43){q=q+1|0;break}if(!((j|0)>1&r<<24>>24==48)){l=22;break}v=a[q+1|0]|0;if(!((v<<24>>24|0)==120|(v<<24>>24|0)==88)){l=22;break}q=q+2|0}else if((r|0)==32){q=h}else{l=22}}while(0);if((l|0)==22){q=t}l=p|0;sh(m,f);y=0;za(20,t|0,q|0,h|0,l|0,d|0,k|0,m|0);if(!y){xg(c[m>>2]|0)|0;c[n>>2]=c[e>>2];bk(b,n,l,c[d>>2]|0,c[k>>2]|0,f,g);i=o;return}else{y=0;v=Mb(-1,-1)|0;xg(c[m>>2]|0)|0;db(v|0)}}function fk(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0;d=i;i=i+320|0;x=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[x>>2];x=d|0;w=d+8|0;s=d+40|0;u=d+48|0;n=d+280|0;o=d+288|0;q=d+296|0;p=d+304|0;m=d+312|0;c[x>>2]=37;c[x+4>>2]=0;A=x+1|0;v=f+4|0;B=c[v>>2]|0;if((B&2048|0)!=0){a[A]=43;A=x+2|0}if((B&1024|0)!=0){a[A]=35;A=A+1|0}z=B&260;B=B>>>14;do{if((z|0)==260){if((B&1|0)==0){a[A]=97;z=0;break}else{a[A]=65;z=0;break}}else{a[A]=46;C=A+2|0;a[A+1|0]=42;if((z|0)==256){if((B&1|0)==0){a[C]=101;z=1;break}else{a[C]=69;z=1;break}}else if((z|0)==4){if((B&1|0)==0){a[C]=102;z=1;break}else{a[C]=70;z=1;break}}else{if((B&1|0)==0){a[C]=103;z=1;break}else{a[C]=71;z=1;break}}}}while(0);w=w|0;c[s>>2]=w;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}A=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=A;break}else{y=0;C=Mb(-1,-1)|0;db(C|0)}}}while(0);A=c[7330]|0;if(z){A=Oj(w,30,A,x,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0;i=C}else{A=Oj(w,30,A,x,(C=i,i=i+8|0,h[C>>3]=j,C)|0)|0;i=C}a:do{if((A|0)>29){A=(a[31424]|0)==0;b:do{if(z){do{if(A){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=z;break}else{y=0;x=Mb(-1,-1)|0;break b}}}while(0);z=(y=0,Ka(4,s|0,c[7330]|0,x|0,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0);i=C;if(!y){l=44}else{y=0;l=36}}else{do{if(A){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=z;break}else{y=0;x=Mb(-1,-1)|0;break b}}}while(0);z=(y=0,Ka(4,s|0,c[7330]|0,x|0,(C=i,i=i+16|0,c[C>>2]=c[f+8>>2],h[C+8>>3]=j,C)|0)|0);i=C;if(!y){l=44}else{y=0;l=36}}}while(0);do{if((l|0)==44){x=c[s>>2]|0;if((x|0)!=0){t=z;k=x;r=x;break a}y=0;Ia(4);if(y){y=0;l=36;break}r=c[s>>2]|0;t=z;k=r;break a}}while(0);if((l|0)==36){x=Mb(-1,-1)|0;}C=x;db(C|0)}else{t=A;k=0;r=c[s>>2]|0}}while(0);x=r+t|0;v=c[v>>2]&176;do{if((v|0)==32){v=x}else if((v|0)==16){v=a[r]|0;if((v<<24>>24|0)==45|(v<<24>>24|0)==43){v=r+1|0;break}if(!((t|0)>1&v<<24>>24==48)){l=53;break}C=a[r+1|0]|0;if(!((C<<24>>24|0)==120|(C<<24>>24|0)==88)){l=53;break}v=r+2|0}else{l=53}}while(0);if((l|0)==53){v=r}do{if((r|0)==(w|0)){t=u|0;u=0;r=w;l=59}else{C=qp(t<<3)|0;l=C;if((C|0)!=0){t=l;u=l;l=59;break}y=0;Ia(4);if(y){y=0;u=0;l=58;break}t=l;u=l;r=c[s>>2]|0;l=59}}while(0);do{if((l|0)==59){y=0;qa(84,q|0,f|0);if(y){y=0;l=58;break}y=0;za(32,r|0,v|0,x|0,t|0,n|0,o|0,q|0);if(y){y=0;f=Mb(-1,-1)|0;xg(c[q>>2]|0)|0;break}xg(c[q>>2]|0)|0;l=e|0;c[m>>2]=c[l>>2];y=0;za(38,p|0,m|0,t|0,c[n>>2]|0,c[o>>2]|0,f|0,g|0);if(y){y=0;l=58;break}C=c[p>>2]|0;c[l>>2]=C;c[b>>2]=C;if((u|0)!=0){rp(u)}if((k|0)==0){i=d;return}rp(k);i=d;return}}while(0);if((l|0)==58){f=Mb(-1,-1)|0;}if((u|0)!=0){rp(u)}if((k|0)==0){C=f;db(C|0)}rp(k);C=f;db(C|0)}function gk(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;m=i;i=i+48|0;r=m|0;p=m+16|0;l=m+32|0;s=k|0;k=c[s>>2]|0;if((c[7714]|0)!=-1){c[p>>2]=30856;c[p+4>>2]=18;c[p+8>>2]=0;Sg(30856,p,114)}t=(c[7715]|0)-1|0;p=c[k+8>>2]|0;if((c[k+12>>2]|0)-p>>2>>>0<=t>>>0){E=lc(4)|0;D=E;Xo(D);Hb(E|0,25592,150)}p=c[p+(t<<2)>>2]|0;if((p|0)==0){E=lc(4)|0;D=E;Xo(D);Hb(E|0,25592,150)}k=p;s=c[s>>2]|0;if((c[7618]|0)!=-1){c[r>>2]=30472;c[r+4>>2]=18;c[r+8>>2]=0;Sg(30472,r,114)}r=(c[7619]|0)-1|0;t=c[s+8>>2]|0;if((c[s+12>>2]|0)-t>>2>>>0<=r>>>0){E=lc(4)|0;D=E;Xo(D);Hb(E|0,25592,150)}r=c[t+(r<<2)>>2]|0;if((r|0)==0){E=lc(4)|0;D=E;Xo(D);Hb(E|0,25592,150)}s=r;zc[c[(c[r>>2]|0)+20>>2]&127](l,s);c[j>>2]=g;t=a[b]|0;do{if((t<<24>>24|0)==45|(t<<24>>24|0)==43){t=(y=0,Da(c[(c[p>>2]|0)+44>>2]|0,k|0,t|0)|0);if(y){y=0;break}v=c[j>>2]|0;c[j>>2]=v+4;c[v>>2]=t;v=b+1|0;u=20}else{v=b;u=20}}while(0);a:do{if((u|0)==20){t=f;b:do{if((t-v|0)>1){if((a[v]|0)!=48){u=21;break}x=v+1|0;E=a[x]|0;if(!((E<<24>>24|0)==120|(E<<24>>24|0)==88)){u=21;break}w=p;z=(y=0,Da(c[(c[w>>2]|0)+44>>2]|0,k|0,48)|0);if(y){y=0;break a}E=c[j>>2]|0;c[j>>2]=E+4;c[E>>2]=z;v=v+2|0;w=(y=0,Da(c[(c[w>>2]|0)+44>>2]|0,k|0,a[x]|0)|0);if(y){y=0;break a}E=c[j>>2]|0;c[j>>2]=E+4;c[E>>2]=w;if(v>>>0<f>>>0){w=v}else{o=v;q=v;break}c:while(1){x=a[w]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(y){y=0;u=32;break c}c[7330]=z}}while(0);x=(y=0,Da(62,x<<24>>24|0,c[7330]|0)|0);if(y){y=0;u=17;break}z=w+1|0;if((x|0)==0){o=w;q=v;break b}if(z>>>0<f>>>0){w=z}else{o=z;q=v;break b}}if((u|0)==17){E=Mb(-1,-1)|0;Yg(l);db(E|0)}else if((u|0)==32){E=Mb(-1,-1)|0;Yg(l);db(E|0)}}else{u=21}}while(0);d:do{if((u|0)==21){if(v>>>0<f>>>0){u=v}else{o=v;q=v;break}e:while(1){x=a[u]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}w=(y=0,ta(8,2147483647,16448,0)|0);if(y){y=0;u=40;break e}c[7330]=w}}while(0);w=(y=0,Da(26,x<<24>>24|0,c[7330]|0)|0);if(y){y=0;u=16;break}x=u+1|0;if((w|0)==0){o=u;q=v;break d}if(x>>>0<f>>>0){u=x}else{o=x;q=v;break d}}if((u|0)==16){E=Mb(-1,-1)|0;Yg(l);db(E|0)}else if((u|0)==40){E=Mb(-1,-1)|0;Yg(l);db(E|0)}}}while(0);w=l;u=l;v=d[u]|0;if((v&1|0)==0){v=v>>>1}else{v=c[l+4>>2]|0}do{if((v|0)==0){E=c[j>>2]|0;D=c[(c[p>>2]|0)+48>>2]|0;y=0,Ka(D|0,k|0,q|0,o|0,E|0)|0;if(y){y=0;break a}c[j>>2]=(c[j>>2]|0)+(o-q<<2)}else{do{if((q|0)!=(o|0)){x=o-1|0;if(q>>>0<x>>>0){v=q}else{break}do{E=a[v]|0;a[v]=a[x]|0;a[x]=E;v=v+1|0;x=x-1|0;}while(v>>>0<x>>>0)}}while(0);v=(y=0,ra(c[(c[r>>2]|0)+16>>2]|0,s|0)|0);if(y){y=0;break a}f:do{if(q>>>0<o>>>0){x=w+1|0;A=l+4|0;w=l+8|0;z=p;C=0;D=0;B=q;while(1){E=(a[u]&1)==0;do{if((a[(E?x:c[w>>2]|0)+D|0]|0)>0){if((C|0)!=(a[(E?x:c[w>>2]|0)+D|0]|0)){break}C=c[j>>2]|0;c[j>>2]=C+4;c[C>>2]=v;C=d[u]|0;D=(D>>>0<(((C&1|0)==0?C>>>1:c[A>>2]|0)-1|0)>>>0)+D|0;C=0}}while(0);E=(y=0,Da(c[(c[z>>2]|0)+44>>2]|0,k|0,a[B]|0)|0);if(y){y=0;break}F=c[j>>2]|0;c[j>>2]=F+4;c[F>>2]=E;B=B+1|0;if(B>>>0<o>>>0){C=C+1|0}else{break f}}F=Mb(-1,-1)|0;Yg(l);db(F|0)}}while(0);u=g+(q-b<<2)|0;q=c[j>>2]|0;if((u|0)==(q|0)){break}q=q-4|0;if(u>>>0>=q>>>0){break}do{F=c[u>>2]|0;c[u>>2]=c[q>>2];c[q>>2]=F;u=u+4|0;q=q-4|0;}while(u>>>0<q>>>0)}}while(0);g:do{if(o>>>0<f>>>0){q=p;while(1){u=a[o]|0;if(u<<24>>24==46){u=66;break}u=(y=0,Da(c[(c[q>>2]|0)+44>>2]|0,k|0,u|0)|0);if(y){y=0;u=14;break}F=c[j>>2]|0;c[j>>2]=F+4;c[F>>2]=u;o=o+1|0;if(o>>>0>=f>>>0){n=o;break g}}if((u|0)==14){F=Mb(-1,-1)|0;Yg(l);db(F|0)}else if((u|0)==66){n=(y=0,ra(c[(c[r>>2]|0)+12>>2]|0,s|0)|0);if(y){y=0;break a}F=c[j>>2]|0;c[j>>2]=F+4;c[F>>2]=n;n=o+1|0;break}}else{n=o}}while(0);F=c[j>>2]|0;E=c[(c[p>>2]|0)+48>>2]|0;y=0,Ka(E|0,k|0,n|0,f|0,F|0)|0;if(y){y=0;break}n=(c[j>>2]|0)+(t-n<<2)|0;c[j>>2]=n;if((e|0)==(f|0)){F=n;c[h>>2]=F;Yg(l);i=m;return}F=g+(e-b<<2)|0;c[h>>2]=F;Yg(l);i=m;return}}while(0);F=Mb(-1,-1)|0;Yg(l);db(F|0)}function hk(b,d,e,f,g,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0;d=i;i=i+320|0;x=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[x>>2];x=d|0;w=d+8|0;s=d+40|0;u=d+48|0;o=d+280|0;p=d+288|0;q=d+296|0;m=d+304|0;n=d+312|0;c[x>>2]=37;c[x+4>>2]=0;B=x+1|0;v=f+4|0;z=c[v>>2]|0;if((z&2048|0)!=0){a[B]=43;B=x+2|0}if((z&1024|0)!=0){a[B]=35;B=B+1|0}A=z&260;z=z>>>14;do{if((A|0)==260){a[B]=76;A=B+1|0;if((z&1|0)==0){a[A]=97;z=0;break}else{a[A]=65;z=0;break}}else{a[B]=46;a[B+1|0]=42;a[B+2|0]=76;B=B+3|0;if((A|0)==256){if((z&1|0)==0){a[B]=101;z=1;break}else{a[B]=69;z=1;break}}else if((A|0)==4){if((z&1|0)==0){a[B]=102;z=1;break}else{a[B]=70;z=1;break}}else{if((z&1|0)==0){a[B]=103;z=1;break}else{a[B]=71;z=1;break}}}}while(0);w=w|0;c[s>>2]=w;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}A=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=A;break}else{y=0;B=Mb(-1,-1)|0;db(B|0)}}}while(0);A=c[7330]|0;if(z){A=Oj(w,30,A,x,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0;i=B}else{A=Oj(w,30,A,x,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0;i=B}a:do{if((A|0)>29){A=(a[31424]|0)==0;b:do{if(z){do{if(A){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=z;break}else{y=0;x=Mb(-1,-1)|0;break b}}}while(0);z=(y=0,Ka(4,s|0,c[7330]|0,x|0,(B=i,i=i+16|0,c[B>>2]=c[f+8>>2],h[B+8>>3]=j,B)|0)|0);i=B;if(!y){l=44}else{y=0;l=36}}else{do{if(A){if((xb(31424)|0)==0){break}z=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=z;break}else{y=0;x=Mb(-1,-1)|0;break b}}}while(0);z=(y=0,Ka(4,s|0,c[7330]|0,x|0,(B=i,i=i+8|0,h[B>>3]=j,B)|0)|0);i=B;if(!y){l=44}else{y=0;l=36}}}while(0);do{if((l|0)==44){x=c[s>>2]|0;if((x|0)!=0){t=z;k=x;r=x;break a}y=0;Ia(4);if(y){y=0;l=36;break}r=c[s>>2]|0;t=z;k=r;break a}}while(0);if((l|0)==36){x=Mb(-1,-1)|0;}B=x;db(B|0)}else{t=A;k=0;r=c[s>>2]|0}}while(0);x=r+t|0;v=c[v>>2]&176;do{if((v|0)==16){v=a[r]|0;if((v<<24>>24|0)==45|(v<<24>>24|0)==43){v=r+1|0;break}if(!((t|0)>1&v<<24>>24==48)){l=53;break}B=a[r+1|0]|0;if(!((B<<24>>24|0)==120|(B<<24>>24|0)==88)){l=53;break}v=r+2|0}else if((v|0)==32){v=x}else{l=53}}while(0);if((l|0)==53){v=r}do{if((r|0)==(w|0)){u=u|0;t=0;r=w;l=59}else{B=qp(t<<3)|0;l=B;if((B|0)!=0){u=l;t=l;l=59;break}y=0;Ia(4);if(y){y=0;t=0;l=58;break}u=l;t=l;r=c[s>>2]|0;l=59}}while(0);do{if((l|0)==59){y=0;qa(84,q|0,f|0);if(y){y=0;l=58;break}y=0;za(32,r|0,v|0,x|0,u|0,o|0,p|0,q|0);if(y){y=0;f=Mb(-1,-1)|0;xg(c[q>>2]|0)|0;break}xg(c[q>>2]|0)|0;e=e|0;c[n>>2]=c[e>>2];y=0;za(38,m|0,n|0,u|0,c[o>>2]|0,c[p>>2]|0,f|0,g|0);if(y){y=0;l=58;break}B=c[m>>2]|0;c[e>>2]=B;c[b>>2]=B;if((t|0)!=0){rp(t)}if((k|0)==0){i=d;return}rp(k);i=d;return}}while(0);if((l|0)==58){f=Mb(-1,-1)|0;}if((t|0)!=0){rp(t)}if((k|0)==0){B=f;db(B|0)}rp(k);B=f;db(B|0)}function ik(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;j=i;i=i+216|0;o=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[o>>2];o=j|0;k=j+24|0;d=j+48|0;r=j+200|0;l=j+208|0;n=j+16|0;a[n]=a[19520]|0;a[n+1|0]=a[19521]|0;a[n+2|0]=a[19522]|0;a[n+3|0]=a[19523]|0;a[n+4|0]=a[19524]|0;a[n+5|0]=a[19525]|0;m=k|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}p=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=p;break}else{y=0;s=Mb(-1,-1)|0;db(s|0)}}}while(0);n=Oj(m,20,c[7330]|0,n,(p=i,i=i+8|0,c[p>>2]=h,p)|0)|0;i=p;h=k+n|0;p=c[f+4>>2]&176;do{if((p|0)==32){p=h}else if((p|0)==16){p=a[m]|0;if((p<<24>>24|0)==45|(p<<24>>24|0)==43){p=k+1|0;break}if(!((n|0)>1&p<<24>>24==48)){q=12;break}s=a[k+1|0]|0;if(!((s<<24>>24|0)==120|(s<<24>>24|0)==88)){q=12;break}p=k+2|0}else{q=12}}while(0);if((q|0)==12){p=m}sh(r,f);q=r|0;r=c[q>>2]|0;do{if((c[7714]|0)!=-1){c[o>>2]=30856;c[o+4>>2]=18;c[o+8>>2]=0;y=0;Ha(4,30856,o|0,114);if(!y){break}else{y=0}s=Mb(-1,-1)|0;o=c[q>>2]|0;o=o|0;xg(o)|0;db(s|0)}}while(0);o=(c[7715]|0)-1|0;s=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-s>>2>>>0>o>>>0){r=c[s+(o<<2)>>2]|0;if((r|0)==0){break}xg(c[q>>2]|0)|0;o=d|0;Tc[c[(c[r>>2]|0)+48>>2]&63](r,m,h,o)|0;m=d+(n<<2)|0;if((p|0)==(h|0)){s=m;q=e|0;q=c[q>>2]|0;r=l|0;c[r>>2]=q;bk(b,l,o,s,m,f,g);i=j;return}s=d+(p-k<<2)|0;q=e|0;q=c[q>>2]|0;r=l|0;c[r>>2]=q;bk(b,l,o,s,m,f,g);i=j;return}}while(0);s=lc(4)|0;Xo(s);y=0;Ha(16,s|0,25592,150);if(y){y=0;s=Mb(-1,-1)|0;r=c[q>>2]|0;r=r|0;xg(r)|0;db(s|0)}}function jk(d,e,f,g,h,j,k,l,m){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;n=i;i=i+48|0;u=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[u>>2];u=g;g=i;i=i+4|0;i=i+7&-8;c[g>>2]=c[u>>2];u=n|0;t=n+16|0;q=n+24|0;r=n+32|0;p=n+40|0;sh(t,h);t=t|0;s=c[t>>2]|0;do{if((c[7716]|0)!=-1){c[u>>2]=30864;c[u+4>>2]=18;c[u+8>>2]=0;y=0;Ha(4,30864,u|0,114);if(!y){break}else{y=0}H=Mb(-1,-1)|0;G=c[t>>2]|0;G=G|0;xg(G)|0;db(H|0)}}while(0);v=(c[7717]|0)-1|0;u=c[s+8>>2]|0;do{if((c[s+12>>2]|0)-u>>2>>>0>v>>>0){x=c[u+(v<<2)>>2]|0;if((x|0)==0){break}s=x;xg(c[t>>2]|0)|0;c[j>>2]=0;w=f|0;a:do{if((l|0)==(m|0)){o=67}else{t=g|0;u=x;v=x+8|0;z=x;x=e;C=r|0;B=p|0;A=q|0;D=0;b:while(1){while(1){if((D|0)!=0){o=67;break a}D=c[w>>2]|0;do{if((D|0)==0){D=0}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){break}if((Ac[c[(c[D>>2]|0)+36>>2]&255](D)|0)!=-1){break}c[w>>2]=0;D=0}}while(0);F=(D|0)==0;E=c[t>>2]|0;c:do{if((E|0)==0){o=20}else{do{if((c[E+12>>2]|0)==(c[E+16>>2]|0)){if((Ac[c[(c[E>>2]|0)+36>>2]&255](E)|0)!=-1){break}c[t>>2]=0;o=20;break c}}while(0);if(!F){o=21;break b}}}while(0);if((o|0)==20){o=0;if(F){o=21;break b}else{E=0}}if((Cc[c[(c[u>>2]|0)+36>>2]&127](s,a[l]|0,0)|0)<<24>>24==37){o=24;break}G=a[l]|0;if(G<<24>>24>-1){F=c[v>>2]|0;if((b[F+(G<<24>>24<<1)>>1]&8192)!=0){o=35;break}}F=D+12|0;G=c[F>>2]|0;E=D+16|0;if((G|0)==(c[E>>2]|0)){G=(Ac[c[(c[D>>2]|0)+36>>2]&255](D)|0)&255}else{G=a[G]|0}H=Mc[c[(c[z>>2]|0)+12>>2]&63](s,G)|0;if(H<<24>>24==(Mc[c[(c[z>>2]|0)+12>>2]&63](s,a[l]|0)|0)<<24>>24){o=62;break}c[j>>2]=4;D=4}d:do{if((o|0)==24){o=0;G=l+1|0;if((G|0)==(m|0)){o=25;break b}F=Cc[c[(c[u>>2]|0)+36>>2]&127](s,a[G]|0,0)|0;if((F<<24>>24|0)==69|(F<<24>>24|0)==48){G=l+2|0;if((G|0)==(m|0)){o=28;break b}l=F;F=Cc[c[(c[u>>2]|0)+36>>2]&127](s,a[G]|0,0)|0}else{l=0}H=c[(c[x>>2]|0)+36>>2]|0;c[C>>2]=D;c[B>>2]=E;Kc[H&7](q,e,r,p,h,j,k,F,l);c[w>>2]=c[A>>2];l=G+1|0}else if((o|0)==35){while(1){o=0;l=l+1|0;if((l|0)==(m|0)){l=m;break}G=a[l]|0;if(G<<24>>24<=-1){break}if((b[F+(G<<24>>24<<1)>>1]&8192)==0){break}else{o=35}}while(1){do{if((D|0)==0){D=0}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){break}if((Ac[c[(c[D>>2]|0)+36>>2]&255](D)|0)!=-1){break}c[w>>2]=0;D=0}}while(0);F=(D|0)==0;do{if((E|0)==0){o=48}else{if((c[E+12>>2]|0)!=(c[E+16>>2]|0)){if(F){break}else{break d}}if((Ac[c[(c[E>>2]|0)+36>>2]&255](E)|0)==-1){c[t>>2]=0;o=48;break}else{if(F^(E|0)==0){break}else{break d}}}}while(0);if((o|0)==48){o=0;if(F){break d}else{E=0}}F=D+12|0;H=c[F>>2]|0;G=D+16|0;if((H|0)==(c[G>>2]|0)){H=(Ac[c[(c[D>>2]|0)+36>>2]&255](D)|0)&255}else{H=a[H]|0}if(H<<24>>24<=-1){break d}if((b[(c[v>>2]|0)+(H<<24>>24<<1)>>1]&8192)==0){break d}H=c[F>>2]|0;if((H|0)==(c[G>>2]|0)){Ac[c[(c[D>>2]|0)+40>>2]&255](D)|0;continue}else{c[F>>2]=H+1;continue}}}else if((o|0)==62){o=0;G=c[F>>2]|0;if((G|0)==(c[E>>2]|0)){Ac[c[(c[D>>2]|0)+40>>2]&255](D)|0}else{c[F>>2]=G+1}l=l+1|0}}while(0);if((l|0)==(m|0)){o=67;break a}D=c[j>>2]|0}if((o|0)==21){c[j>>2]=4;break}else if((o|0)==25){c[j>>2]=4;break}else if((o|0)==28){c[j>>2]=4;break}}}while(0);if((o|0)==67){D=c[w>>2]|0}f=f|0;do{if((D|0)!=0){if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){break}if((Ac[c[(c[D>>2]|0)+36>>2]&255](D)|0)!=-1){break}c[f>>2]=0}}while(0);f=c[f>>2]|0;p=(f|0)==0;g=g|0;q=c[g>>2]|0;e:do{if((q|0)==0){o=77}else{do{if((c[q+12>>2]|0)==(c[q+16>>2]|0)){if((Ac[c[(c[q>>2]|0)+36>>2]&255](q)|0)!=-1){break}c[g>>2]=0;o=77;break e}}while(0);if(!p){break}H=d|0;c[H>>2]=f;i=n;return}}while(0);do{if((o|0)==77){if(p){break}H=d|0;c[H>>2]=f;i=n;return}}while(0);c[j>>2]=c[j>>2]|2;H=d|0;c[H>>2]=f;i=n;return}}while(0);H=lc(4)|0;Xo(H);y=0;Ha(16,H|0,25592,150);if(y){y=0;H=Mb(-1,-1)|0;G=c[t>>2]|0;G=G|0;xg(G)|0;db(H|0)}}function kk(a){a=a|0;vg(a|0);xp(a);return}function lk(a){a=a|0;vg(a|0);return}function mk(a){a=a|0;return 2}function nk(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;m=d;l=i;i=i+4|0;i=i+7&-8;c[l>>2]=c[m>>2];m=e;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[m>>2];e=j|0;d=j+8|0;c[e>>2]=c[l>>2];c[d>>2]=c[k>>2];jk(a,b,e,d,f,g,h,19504,19512);i=j;return}function ok(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0;k=i;i=i+16|0;m=e;o=i;i=i+4|0;i=i+7&-8;c[o>>2]=c[m>>2];m=f;n=i;i=i+4|0;i=i+7&-8;c[n>>2]=c[m>>2];e=k|0;f=k+8|0;m=d+8|0;m=Ac[c[(c[m>>2]|0)+20>>2]&255](m)|0;c[e>>2]=c[o>>2];c[f>>2]=c[n>>2];n=m;o=a[m]|0;if((o&1)==0){l=n+1|0;n=n+1|0}else{n=c[m+8>>2]|0;l=n}o=o&255;if((o&1|0)==0){m=o>>>1}else{m=c[m+4>>2]|0}jk(b,d,e,f,g,h,j,n,l+m|0);i=k;return}function pk(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;m=j+8|0;l=j+24|0;sh(l,f);f=l|0;l=c[f>>2]|0;do{if((c[7716]|0)!=-1){c[m>>2]=30864;c[m+4>>2]=18;c[m+8>>2]=0;y=0;Ha(4,30864,m|0,114);if(!y){break}else{y=0}n=Mb(-1,-1)|0;m=c[f>>2]|0;m=m|0;xg(m)|0;db(n|0)}}while(0);m=(c[7717]|0)-1|0;n=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-n>>2>>>0>m>>>0){l=c[n+(m<<2)>>2]|0;if((l|0)==0){break}xg(c[f>>2]|0)|0;n=c[e>>2]|0;e=b+8|0;e=Ac[c[c[e>>2]>>2]&255](e)|0;c[k>>2]=n;e=(Mi(d,k,e,e+168|0,l,g,0)|0)-e|0;if((e|0)>=168){m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=j;return}c[h+24>>2]=((e|0)/12|0|0)%7|0;m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=j;return}}while(0);n=lc(4)|0;Xo(n);y=0;Ha(16,n|0,25592,150);if(y){y=0;n=Mb(-1,-1)|0;m=c[f>>2]|0;m=m|0;xg(m)|0;db(n|0)}}function qk(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;m=j+8|0;l=j+24|0;sh(l,f);f=l|0;l=c[f>>2]|0;do{if((c[7716]|0)!=-1){c[m>>2]=30864;c[m+4>>2]=18;c[m+8>>2]=0;y=0;Ha(4,30864,m|0,114);if(!y){break}else{y=0}n=Mb(-1,-1)|0;m=c[f>>2]|0;m=m|0;xg(m)|0;db(n|0)}}while(0);m=(c[7717]|0)-1|0;n=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-n>>2>>>0>m>>>0){l=c[n+(m<<2)>>2]|0;if((l|0)==0){break}xg(c[f>>2]|0)|0;n=c[e>>2]|0;e=b+8|0;e=Ac[c[(c[e>>2]|0)+4>>2]&255](e)|0;c[k>>2]=n;e=(Mi(d,k,e,e+288|0,l,g,0)|0)-e|0;if((e|0)>=288){m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=j;return}c[h+16>>2]=((e|0)/12|0|0)%12|0;m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=j;return}}while(0);n=lc(4)|0;Xo(n);y=0;Ha(16,n|0,25592,150);if(y){y=0;n=Mb(-1,-1)|0;m=c[f>>2]|0;m=m|0;xg(m)|0;db(n|0)}}function rk(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;l=b+8|0;k=b+24|0;sh(k,f);f=k|0;k=c[f>>2]|0;do{if((c[7716]|0)!=-1){c[l>>2]=30864;c[l+4>>2]=18;c[l+8>>2]=0;y=0;Ha(4,30864,l|0,114);if(!y){break}else{y=0}m=Mb(-1,-1)|0;l=c[f>>2]|0;l=l|0;xg(l)|0;db(m|0)}}while(0);m=(c[7717]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>m>>>0){k=c[l+(m<<2)>>2]|0;if((k|0)==0){break}xg(c[f>>2]|0)|0;c[j>>2]=c[e>>2];e=wk(d,j,g,k,4)|0;if((c[g>>2]&4|0)!=0){l=d|0;l=c[l>>2]|0;m=a|0;c[m>>2]=l;i=b;return}if((e|0)<69){g=e+2e3|0}else{g=(e-69|0)>>>0<31>>>0?e+1900|0:e}c[h+20>>2]=g-1900;l=d|0;l=c[l>>2]|0;m=a|0;c[m>>2]=l;i=b;return}}while(0);m=lc(4)|0;Xo(m);y=0;Ha(16,m|0,25592,150);if(y){y=0;m=Mb(-1,-1)|0;l=c[f>>2]|0;l=l|0;xg(l)|0;db(m|0)}}



function wm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;g=i;i=i+448|0;h=g|0;j=g+16|0;k=g+32|0;l=g+48|0;q=g+64|0;o=g+80|0;v=g+96|0;t=g+112|0;x=g+128|0;C=g+144|0;F=g+160|0;B=g+176|0;E=g+192|0;A=g+208|0;m=g+224|0;D=g+240|0;n=g+256|0;p=g+272|0;r=g+288|0;s=g+304|0;u=g+320|0;w=g+336|0;z=g+352|0;G=g+368|0;H=g+384|0;J=g+400|0;K=g+416|0;L=g+432|0;c[b+4>>2]=d-1;c[b>>2]=20984;f=b+8|0;e=b+12|0;d=b+136|0;a[d]=1;I=b+24|0;M=I;c[e>>2]=M;c[f>>2]=M;c[b+16>>2]=I+112;I=28;do{if((M|0)==0){M=0}else{c[M>>2]=0;M=c[e>>2]|0}M=M+4|0;c[e>>2]=M;I=I-1|0;}while((I|0)!=0);I=b+144|0;y=0;Ha(30,I|0,16448,1);if(!y){N=c[f>>2]|0;M=c[e>>2]|0;if((N|0)!=(M|0)){c[e>>2]=M+(~((M-4+(-N|0)|0)>>>2)<<2)}c[7387]=0;c[7386]=20688;if((c[7636]|0)==-1){L=10}else{c[L>>2]=30544;c[L+4>>2]=18;c[L+8>>2]=0;y=0;Ha(4,30544,L|0,114);if(!y){L=10}else{y=0;L=111}}a:do{if((L|0)==10){y=0;Ha(14,b|0,29544,(c[7637]|0)-1|0);if(y){y=0;L=111;break}c[7385]=0;c[7384]=20648;if((c[7634]|0)!=-1){c[K>>2]=30536;c[K+4>>2]=18;c[K+8>>2]=0;y=0;Ha(4,30536,K|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29536,(c[7635]|0)-1|0);if(y){y=0;L=111;break}c[7441]=0;c[7440]=21096;c[7442]=0;a[29772]=0;K=(y=0,Fa(6)|0);if(y){y=0;N=Mb(-1,-1,0)|0;nd(N)}c[7442]=c[K>>2];if((c[7716]|0)!=-1){c[J>>2]=30864;c[J+4>>2]=18;c[J+8>>2]=0;y=0;Ha(4,30864,J|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29760,(c[7717]|0)-1|0);if(y){y=0;L=111;break}c[7439]=0;c[7438]=21016;if((c[7714]|0)!=-1){c[H>>2]=30856;c[H+4>>2]=18;c[H+8>>2]=0;y=0;Ha(4,30856,H|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29752,(c[7715]|0)-1|0);if(y){y=0;L=111;break}c[7393]=0;c[7392]=20784;if((c[7640]|0)!=-1){c[G>>2]=30560;c[G+4>>2]=18;c[G+8>>2]=0;y=0;Ha(4,30560,G|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29568,(c[7641]|0)-1|0);if(y){y=0;L=111;break}c[7389]=0;c[7388]=20728;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}G=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=G;break}else{y=0;g=Mb(-1,-1)|0;vg(29552);break a}}}while(0);c[7390]=c[7330];if((c[7638]|0)!=-1){c[z>>2]=30552;c[z+4>>2]=18;c[z+8>>2]=0;y=0;Ha(4,30552,z|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29552,(c[7639]|0)-1|0);if(y){y=0;L=111;break}c[7395]=0;c[7394]=20840;if((c[7642]|0)!=-1){c[w>>2]=30568;c[w+4>>2]=18;c[w+8>>2]=0;y=0;Ha(4,30568,w|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29576,(c[7643]|0)-1|0);if(y){y=0;L=111;break}c[7397]=0;c[7396]=20896;if((c[7644]|0)!=-1){c[u>>2]=30576;c[u+4>>2]=18;c[u+8>>2]=0;y=0;Ha(4,30576,u|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29584,(c[7645]|0)-1|0);if(y){y=0;L=111;break}c[7367]=0;c[7366]=20192;a[29472]=46;a[29473]=44;Pp(29476,0,12)|0;if((c[7620]|0)!=-1){c[s>>2]=30480;c[s+4>>2]=18;c[s+8>>2]=0;y=0;Ha(4,30480,s|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29464,(c[7621]|0)-1|0);if(y){y=0;L=111;break}c[7359]=0;c[7358]=20144;c[7360]=46;c[7361]=44;Pp(29448,0,12)|0;if((c[7618]|0)!=-1){c[r>>2]=30472;c[r+4>>2]=18;c[r+8>>2]=0;y=0;Ha(4,30472,r|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29432,(c[7619]|0)-1|0);if(y){y=0;L=111;break}c[7383]=0;c[7382]=20576;if((c[7632]|0)!=-1){c[p>>2]=30528;c[p+4>>2]=18;c[p+8>>2]=0;y=0;Ha(4,30528,p|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29528,(c[7633]|0)-1|0);if(y){y=0;L=111;break}c[7381]=0;c[7380]=20504;if((c[7630]|0)!=-1){c[n>>2]=30520;c[n+4>>2]=18;c[n+8>>2]=0;y=0;Ha(4,30520,n|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29520,(c[7631]|0)-1|0);if(y){y=0;L=111;break}c[7379]=0;c[7378]=20440;if((c[7628]|0)!=-1){c[D>>2]=30512;c[D+4>>2]=18;c[D+8>>2]=0;y=0;Ha(4,30512,D|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29512,(c[7629]|0)-1|0);if(y){y=0;L=111;break}c[7377]=0;c[7376]=20376;if((c[7626]|0)!=-1){c[m>>2]=30504;c[m+4>>2]=18;c[m+8>>2]=0;y=0;Ha(4,30504,m|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29504,(c[7627]|0)-1|0);if(y){y=0;L=111;break}c[7451]=0;c[7450]=22144;if((c[7836]|0)!=-1){c[A>>2]=31344;c[A+4>>2]=18;c[A+8>>2]=0;y=0;Ha(4,31344,A|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29800,(c[7837]|0)-1|0);if(y){y=0;L=111;break}c[7449]=0;c[7448]=22080;if((c[7834]|0)!=-1){c[E>>2]=31336;c[E+4>>2]=18;c[E+8>>2]=0;y=0;Ha(4,31336,E|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29792,(c[7835]|0)-1|0);if(y){y=0;L=111;break}c[7447]=0;c[7446]=22016;if((c[7832]|0)!=-1){c[B>>2]=31328;c[B+4>>2]=18;c[B+8>>2]=0;y=0;Ha(4,31328,B|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29784,(c[7833]|0)-1|0);if(y){y=0;L=111;break}c[7445]=0;c[7444]=21952;if((c[7830]|0)!=-1){c[F>>2]=31320;c[F+4>>2]=18;c[F+8>>2]=0;y=0;Ha(4,31320,F|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29776,(c[7831]|0)-1|0);if(y){y=0;L=111;break}c[7341]=0;c[7340]=19848;if((c[7608]|0)!=-1){c[C>>2]=30432;c[C+4>>2]=18;c[C+8>>2]=0;y=0;Ha(4,30432,C|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29360,(c[7609]|0)-1|0);if(y){y=0;L=111;break}c[7339]=0;c[7338]=19808;if((c[7606]|0)!=-1){c[x>>2]=30424;c[x+4>>2]=18;c[x+8>>2]=0;y=0;Ha(4,30424,x|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29352,(c[7607]|0)-1|0);if(y){y=0;L=111;break}c[7337]=0;c[7336]=19768;if((c[7604]|0)!=-1){c[t>>2]=30416;c[t+4>>2]=18;c[t+8>>2]=0;y=0;Ha(4,30416,t|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29344,(c[7605]|0)-1|0);if(y){y=0;L=111;break}c[7335]=0;c[7334]=19728;if((c[7602]|0)!=-1){c[v>>2]=30408;c[v+4>>2]=18;c[v+8>>2]=0;y=0;Ha(4,30408,v|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29336,(c[7603]|0)-1|0);if(y){y=0;L=111;break}c[7355]=0;c[7354]=20048;c[7356]=20096;if((c[7616]|0)!=-1){c[o>>2]=30464;c[o+4>>2]=18;c[o+8>>2]=0;y=0;Ha(4,30464,o|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29416,(c[7617]|0)-1|0);if(y){y=0;L=111;break}c[7351]=0;c[7350]=19952;c[7352]=2e4;if((c[7614]|0)!=-1){c[q>>2]=30456;c[q+4>>2]=18;c[q+8>>2]=0;y=0;Ha(4,30456,q|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29400,(c[7615]|0)-1|0);if(y){y=0;L=111;break}c[7347]=0;c[7346]=20952;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}m=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=m;break}else{y=0;g=Mb(-1,-1)|0;vg(29384);break a}}}while(0);c[7348]=c[7330];c[7346]=19920;if((c[7612]|0)!=-1){c[l>>2]=30448;c[l+4>>2]=18;c[l+8>>2]=0;y=0;Ha(4,30448,l|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29384,(c[7613]|0)-1|0);if(y){y=0;L=111;break}c[7343]=0;c[7342]=20952;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;g=Mb(-1,-1)|0;vg(29368);break a}}}while(0);c[7344]=c[7330];c[7342]=19888;if((c[7610]|0)!=-1){c[k>>2]=30440;c[k+4>>2]=18;c[k+8>>2]=0;y=0;Ha(4,30440,k|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29368,(c[7611]|0)-1|0);if(y){y=0;L=111;break}c[7375]=0;c[7374]=20280;if((c[7624]|0)!=-1){c[j>>2]=30496;c[j+4>>2]=18;c[j+8>>2]=0;y=0;Ha(4,30496,j|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29496,(c[7625]|0)-1|0);if(y){y=0;L=111;break}c[7373]=0;c[7372]=20240;if((c[7622]|0)!=-1){c[h>>2]=30488;c[h+4>>2]=18;c[h+8>>2]=0;y=0;Ha(4,30488,h|0,114);if(y){y=0;L=111;break}}y=0;Ha(14,b|0,29488,(c[7623]|0)-1|0);if(y){y=0;L=111;break}i=g;return}}while(0);if((L|0)==111){g=Mb(-1,-1)|0;}Yg(I)}else{y=0;g=Mb(-1,-1)|0;}f=c[f>>2]|0;if((f|0)==0){N=b|0;vg(N);N=g;db(N|0)}h=c[e>>2]|0;if((f|0)!=(h|0)){c[e>>2]=h+(~((h-4+(-f|0)|0)>>>2)<<2)}if((f|0)==(b+24|0)){a[d]=0;N=b|0;vg(N);N=g;db(N|0)}else{xp(f);N=b|0;vg(N);N=g;db(N|0)}}function xm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=b|0;wg(f);g=a+8|0;j=a+12|0;i=c[j>>2]|0;a=g|0;h=c[a>>2]|0;k=i-h>>2;do{if(k>>>0>d>>>0){e=h}else{l=d+1|0;if(k>>>0>=l>>>0){if(k>>>0<=l>>>0){e=h;break}e=h+(l<<2)|0;if((e|0)==(i|0)){e=h;break}c[j>>2]=i+(~((i-4+(-e|0)|0)>>>2)<<2);e=h;break}y=0;qa(110,g|0,l-k|0);if(!y){e=c[a>>2]|0;break}else{y=0}g=Mb(-1,-1)|0;if((b|0)==0){db(g|0)}xg(f)|0;db(g|0)}}while(0);f=c[e+(d<<2)>>2]|0;if((f|0)==0){l=e;l=l+(d<<2)|0;c[l>>2]=b;return}xg(f|0)|0;l=c[a>>2]|0;l=l+(d<<2)|0;c[l>>2]=b;return}function ym(a){a=a|0;zm(a);xp(a);return}function zm(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;c[b>>2]=20984;d=b+12|0;h=c[d>>2]|0;e=b+8|0;g=c[e>>2]|0;if((h|0)!=(g|0)){f=0;do{i=c[g+(f<<2)>>2]|0;if((i|0)!=0){xg(i|0)|0;h=c[d>>2]|0;g=c[e>>2]|0}f=f+1|0;}while(f>>>0<h-g>>2>>>0)}Yg(b+144|0);e=c[e>>2]|0;if((e|0)==0){i=b|0;vg(i);return}f=c[d>>2]|0;if((e|0)!=(f|0)){c[d>>2]=f+(~((f-4+(-e|0)|0)>>>2)<<2)}if((e|0)==(b+24|0)){a[b+136|0]=0;i=b|0;vg(i);return}else{xp(e);i=b|0;vg(i);return}}function Am(){var b=0;if((a[31408]|0)!=0){b=c[7322]|0;return b|0}if((xb(31408)|0)==0){b=c[7322]|0;return b|0}do{if((a[31416]|0)==0){if((xb(31416)|0)==0){break}y=0;qa(82,29592,1);if(!y){c[7326]=29592;c[7324]=29304;break}else{y=0;b=Mb(-1,-1)|0;db(b|0)}}}while(0);b=c[c[7324]>>2]|0;c[7328]=b;wg(b|0);c[7322]=29312;b=c[7322]|0;return b|0}function Bm(a){a=a|0;var b=0;b=(y=0,Fa(4)|0);if(!y){b=c[b>>2]|0;c[a>>2]=b;wg(b|0);return}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}function Cm(a,b){a=a|0;b=b|0;b=c[b>>2]|0;c[a>>2]=b;wg(b|0);return}function Dm(a){a=a|0;xg(c[a>>2]|0)|0;return}function Em(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d|0;a=c[a>>2]|0;f=b|0;if((c[f>>2]|0)!=-1){c[e>>2]=b;c[e+4>>2]=18;c[e+8>>2]=0;Sg(f,e,114)}e=(c[b+4>>2]|0)-1|0;b=c[a+8>>2]|0;if((c[a+12>>2]|0)-b>>2>>>0<=e>>>0){f=lc(4)|0;e=f;Xo(e);Hb(f|0,25592,150);return 0}a=c[b+(e<<2)>>2]|0;if((a|0)==0){f=lc(4)|0;e=f;Xo(e);Hb(f|0,25592,150);return 0}else{i=d;return a|0}return 0}function Fm(a){a=a|0;vg(a|0);xp(a);return}function Gm(a){a=a|0;if((a|0)==0){return}yc[c[(c[a>>2]|0)+4>>2]&511](a);return}function Hm(a){a=a|0;c[a+4>>2]=(J=c[7646]|0,c[7646]=J+1,J)+1;return}function Im(a){a=a|0;vg(a|0);xp(a);return}function Jm(a,d,e){a=a|0;d=d|0;e=e|0;if(e>>>0>=128>>>0){a=0;return a|0}a=(y=0,Fa(6)|0);if(y){y=0;a=Mb(-1,-1,0)|0;nd(a);return 0}a=(b[(c[a>>2]|0)+(e<<1)>>1]&d)<<16>>16!=0;return a|0}function Km(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0;if((d|0)==(e|0)){g=d;return g|0}while(1){a=c[d>>2]|0;if(a>>>0<128>>>0){g=(y=0,Fa(6)|0);if(y){y=0;d=4;break}a=b[(c[g>>2]|0)+(a<<1)>>1]|0}else{a=0}b[f>>1]=a;d=d+4|0;if((d|0)==(e|0)){d=7;break}else{f=f+2|0}}if((d|0)==4){g=Mb(-1,-1,0)|0;nd(g);return 0}else if((d|0)==7){return e|0}return 0}function Lm(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0;if((e|0)==(f|0)){g=e;return g|0}while(1){a=c[e>>2]|0;if(a>>>0<128>>>0){g=(y=0,Fa(6)|0);if(y){y=0;d=4;break}if((b[(c[g>>2]|0)+(a<<1)>>1]&d)<<16>>16!=0){f=e;d=7;break}}e=e+4|0;if((e|0)==(f|0)){d=7;break}}if((d|0)==4){g=Mb(-1,-1,0)|0;nd(g);return 0}else if((d|0)==7){return f|0}return 0}function Mm(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;if((e|0)==(f|0)){h=e;return h|0}while(1){a=c[e>>2]|0;if(a>>>0>=128>>>0){f=e;d=7;break}g=(y=0,Fa(6)|0);if(y){y=0;d=5;break}h=e+4|0;if((b[(c[g>>2]|0)+(a<<1)>>1]&d)<<16>>16==0){f=e;d=7;break}if((h|0)==(f|0)){d=7;break}else{e=h}}if((d|0)==5){h=Mb(-1,-1,0)|0;nd(h);return 0}else if((d|0)==7){return f|0}return 0}function Nm(a,b){a=a|0;b=b|0;if(b>>>0>=128>>>0){a=b;return a|0}a=(y=0,Fa(8)|0);if(y){y=0;a=Mb(-1,-1,0)|0;nd(a);return 0}a=c[(c[a>>2]|0)+(b<<2)>>2]|0;return a|0}function Om(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((b|0)==(d|0)){e=b;return e|0}while(1){a=c[b>>2]|0;if(a>>>0<128>>>0){e=(y=0,Fa(8)|0);if(y){y=0;b=4;break}a=c[(c[e>>2]|0)+(a<<2)>>2]|0}c[b>>2]=a;b=b+4|0;if((b|0)==(d|0)){b=7;break}}if((b|0)==4){e=Mb(-1,-1,0)|0;nd(e);return 0}else if((b|0)==7){return d|0}return 0}function Pm(a,b){a=a|0;b=b|0;if(b>>>0>=128>>>0){a=b;return a|0}a=(y=0,Fa(2)|0);if(y){y=0;a=Mb(-1,-1,0)|0;nd(a);return 0}a=c[(c[a>>2]|0)+(b<<2)>>2]|0;return a|0}function Qm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((b|0)==(d|0)){e=b;return e|0}while(1){a=c[b>>2]|0;if(a>>>0<128>>>0){e=(y=0,Fa(2)|0);if(y){y=0;b=4;break}a=c[(c[e>>2]|0)+(a<<2)>>2]|0}c[b>>2]=a;b=b+4|0;if((b|0)==(d|0)){b=7;break}}if((b|0)==4){e=Mb(-1,-1,0)|0;nd(e);return 0}else if((b|0)==7){return d|0}return 0}function Rm(a,b){a=a|0;b=b|0;return b<<24>>24|0}function Sm(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;if((d|0)==(e|0)){b=d;return b|0}while(1){c[f>>2]=a[d]|0;d=d+1|0;if((d|0)==(e|0)){break}else{f=f+4|0}}return e|0}function Tm(a,b,c){a=a|0;b=b|0;c=c|0;return(b>>>0<128>>>0?b&255:c)|0}function Um(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;if((d|0)==(e|0)){i=d;return i|0}b=((e-4+(-d|0)|0)>>>2)+1|0;h=d;while(1){i=c[h>>2]|0;a[g]=i>>>0<128>>>0?i&255:f;h=h+4|0;if((h|0)==(e|0)){break}else{g=g+1|0}}i=d+(b<<2)|0;return i|0}function Vm(b){b=b|0;var d=0;c[b>>2]=21096;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}yp(d)}}while(0);vg(b|0);xp(b);return}function Wm(b){b=b|0;var d=0;c[b>>2]=21096;d=c[b+8>>2]|0;do{if((d|0)!=0){if((a[b+12|0]&1)==0){break}yp(d)}}while(0);vg(b|0);return}function Xm(a,b){a=a|0;b=b|0;if(b<<24>>24<=-1){a=b;return a|0}a=(y=0,Fa(8)|0);if(y){y=0;a=Mb(-1,-1,0)|0;nd(a);return 0}a=c[(c[a>>2]|0)+((b&255)<<2)>>2]&255;return a|0}function Ym(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((d|0)==(e|0)){f=d;return f|0}while(1){b=a[d]|0;if(b<<24>>24>-1){f=(y=0,Fa(8)|0);if(y){y=0;d=4;break}b=c[(c[f>>2]|0)+(b<<24>>24<<2)>>2]&255}a[d]=b;d=d+1|0;if((d|0)==(e|0)){d=7;break}}if((d|0)==4){f=Mb(-1,-1,0)|0;nd(f);return 0}else if((d|0)==7){return e|0}return 0}function Zm(a,b){a=a|0;b=b|0;if(b<<24>>24<=-1){a=b;return a|0}a=(y=0,Fa(2)|0);if(y){y=0;a=Mb(-1,-1,0)|0;nd(a);return 0}a=c[(c[a>>2]|0)+(b<<24>>24<<2)>>2]&255;return a|0}function _m(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((d|0)==(e|0)){f=d;return f|0}while(1){b=a[d]|0;if(b<<24>>24>-1){f=(y=0,Fa(2)|0);if(y){y=0;d=4;break}b=c[(c[f>>2]|0)+(b<<24>>24<<2)>>2]&255}a[d]=b;d=d+1|0;if((d|0)==(e|0)){d=7;break}}if((d|0)==4){f=Mb(-1,-1,0)|0;nd(f);return 0}else if((d|0)==7){return e|0}return 0}function $m(a,b){a=a|0;b=b|0;return b|0}function an(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;if((c|0)==(d|0)){b=c;return b|0}while(1){a[e]=a[c]|0;c=c+1|0;if((c|0)==(d|0)){break}else{e=e+1|0}}return d|0}function bn(a,b,c){a=a|0;b=b|0;c=c|0;return(b<<24>>24>-1?b:c)|0}function cn(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;if((c|0)==(d|0)){b=c;return b|0}while(1){b=a[c]|0;a[f]=b<<24>>24>-1?b:e;c=c+1|0;if((c|0)==(d|0)){break}else{f=f+1|0}}return d|0}function dn(a){a=a|0;vg(a|0);xp(a);return}function en(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function fn(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;c[f>>2]=d;c[i>>2]=g;return 3}function gn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function hn(a){a=a|0;return 1}function jn(a){a=a|0;return 1}function kn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;c=d-c|0;return(c>>>0<e>>>0?c:e)|0}function ln(a){a=a|0;return 1}function mn(a){a=a|0;um(a);xp(a);return}function nn(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;l=i;i=i+8|0;p=l|0;n=p;s=i;i=i+4|0;i=i+7&-8;q=(e|0)==(f|0);a:do{if(q){c[k>>2]=h;c[g>>2]=e;o=e}else{t=e;while(1){r=t+4|0;if((c[t>>2]|0)==0){break}if((r|0)==(f|0)){t=f;break}else{t=r}}c[k>>2]=h;c[g>>2]=e;if(q|(h|0)==(j|0)){o=e;break}r=d;q=j;b=b+8|0;s=s|0;while(1){u=c[r+4>>2]|0;c[p>>2]=c[r>>2];c[p+4>>2]=u;u=_b(c[b>>2]|0)|0;v=(y=0,Ga(20,h|0,g|0,t-e>>2|0,q-h|0,d|0)|0);if(y){y=0;j=11;break}if((u|0)!=0){y=0,ra(44,u|0)|0;if(y){y=0;j=10;break}}if((v|0)==0){m=1;j=51;break}else if((v|0)==(-1|0)){j=16;break}h=(c[k>>2]|0)+v|0;c[k>>2]=h;if((h|0)==(j|0)){j=49;break}if((t|0)==(f|0)){t=f;e=c[g>>2]|0}else{h=_b(c[b>>2]|0)|0;t=(y=0,ta(12,s|0,0,d|0)|0);if(y){y=0;j=35;break}if((h|0)!=0){y=0,ra(44,h|0)|0;if(y){y=0;j=34;break}}if((t|0)==-1){m=2;j=51;break}e=c[k>>2]|0;if(t>>>0>(q-e|0)>>>0){m=1;j=51;break}b:do{if((t|0)!=0){h=s;while(1){v=a[h]|0;c[k>>2]=e+1;a[e]=v;t=t-1|0;if((t|0)==0){break b}h=h+1|0;e=c[k>>2]|0}}}while(0);e=(c[g>>2]|0)+4|0;c[g>>2]=e;c:do{if((e|0)==(f|0)){t=f}else{t=e;while(1){h=t+4|0;if((c[t>>2]|0)==0){break c}if((h|0)==(f|0)){t=f;break}else{t=h}}}}while(0);h=c[k>>2]|0}if((e|0)==(f|0)|(h|0)==(j|0)){o=e;break a}}if((j|0)==10){v=Mb(-1,-1,0)|0;nd(v);return 0}else if((j|0)==11){m=Mb(-1,-1)|0;if((u|0)==0){db(m|0)}y=0,ra(44,u|0)|0;if(!y){db(m|0)}else{y=0;v=Mb(-1,-1,0)|0;nd(v);return 0}}else if((j|0)==16){c[k>>2]=h;d:do{if((e|0)==(c[g>>2]|0)){m=e}else{while(1){o=c[e>>2]|0;f=_b(c[b>>2]|0)|0;o=(y=0,ta(12,h|0,o|0,n|0)|0);if(y){y=0;break}if((f|0)!=0){y=0,ra(44,f|0)|0;if(y){y=0;j=20;break}}if((o|0)==-1){m=e;break d}h=(c[k>>2]|0)+o|0;c[k>>2]=h;e=e+4|0;if((e|0)==(c[g>>2]|0)){m=e;break d}}if((j|0)==20){v=Mb(-1,-1,0)|0;nd(v);return 0}n=Mb(-1,-1)|0;if((f|0)==0){db(n|0)}y=0,ra(44,f|0)|0;if(!y){db(n|0)}else{y=0;v=Mb(-1,-1,0)|0;nd(v);return 0}}}while(0);c[g>>2]=m;v=2;i=l;return v|0}else if((j|0)==34){v=Mb(-1,-1,0)|0;nd(v);return 0}else if((j|0)==35){m=Mb(-1,-1)|0;if((h|0)==0){db(m|0)}y=0,ra(44,h|0)|0;if(!y){db(m|0)}else{y=0;v=Mb(-1,-1,0)|0;nd(v);return 0}}else if((j|0)==49){o=c[g>>2]|0;break}else if((j|0)==51){i=l;return m|0}}}while(0);v=(o|0)!=(f|0)|0;i=l;return v|0}function on(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;l=i;i=i+8|0;p=l|0;n=p;q=(e|0)==(f|0);a:do{if(q){c[k>>2]=h;c[g>>2]=e;o=e}else{t=e;while(1){r=t+1|0;if((a[t]|0)==0){break}if((r|0)==(f|0)){t=f;break}else{t=r}}c[k>>2]=h;c[g>>2]=e;if(q|(h|0)==(j|0)){o=e;break}r=d;q=j;b=b+8|0;while(1){s=c[r+4>>2]|0;c[p>>2]=c[r>>2];c[p+4>>2]=s;s=t;u=_b(c[b>>2]|0)|0;v=(y=0,Ga(6,h|0,g|0,s-e|0,q-h>>2|0,d|0)|0);if(y){y=0;j=11;break}if((u|0)!=0){y=0,ra(44,u|0)|0;if(y){y=0;j=10;break}}if((v|0)==(-1|0)){j=16;break}else if((v|0)==0){f=2;j=50;break}h=(c[k>>2]|0)+(v<<2)|0;c[k>>2]=h;if((h|0)==(j|0)){j=48;break}e=c[g>>2]|0;if((t|0)==(f|0)){t=f}else{s=_b(c[b>>2]|0)|0;h=(y=0,Ka(28,h|0,e|0,1,d|0)|0);if(y){y=0;j=38;break}if((s|0)!=0){y=0,ra(44,s|0)|0;if(y){y=0;j=37;break}}if((h|0)!=0){f=2;j=50;break}c[k>>2]=(c[k>>2]|0)+4;e=(c[g>>2]|0)+1|0;c[g>>2]=e;b:do{if((e|0)==(f|0)){t=f}else{t=e;while(1){s=t+1|0;if((a[t]|0)==0){break b}if((s|0)==(f|0)){t=f;break}else{t=s}}}}while(0);h=c[k>>2]|0}if((e|0)==(f|0)|(h|0)==(j|0)){o=e;break a}}if((j|0)==10){v=Mb(-1,-1,0)|0;nd(v);return 0}else if((j|0)==11){m=Mb(-1,-1)|0;if((u|0)==0){db(m|0)}y=0,ra(44,u|0)|0;if(!y){db(m|0)}else{y=0;v=Mb(-1,-1,0)|0;nd(v);return 0}}else if((j|0)==16){c[k>>2]=h;c:do{if((e|0)==(c[g>>2]|0)){m=e}else{while(1){o=_b(c[b>>2]|0)|0;j=(y=0,Ka(28,h|0,e|0,s-e|0,n|0)|0);if(y){y=0;j=21;break}if((o|0)!=0){y=0,ra(44,o|0)|0;if(y){y=0;j=20;break}}if((j|0)==0){e=e+1|0}else if((j|0)==(-1|0)){j=27;break}else if((j|0)==(-2|0)){j=28;break}else{e=e+j|0}h=(c[k>>2]|0)+4|0;c[k>>2]=h;if((e|0)==(c[g>>2]|0)){m=e;break c}}if((j|0)==20){v=Mb(-1,-1,0)|0;nd(v);return 0}else if((j|0)==21){k=Mb(-1,-1)|0;if((o|0)==0){db(k|0)}y=0,ra(44,o|0)|0;if(!y){db(k|0)}else{y=0;v=Mb(-1,-1,0)|0;nd(v);return 0}}else if((j|0)==27){c[g>>2]=e;v=2;i=l;return v|0}else if((j|0)==28){c[g>>2]=e;v=1;i=l;return v|0}}}while(0);c[g>>2]=m;v=(m|0)!=(f|0)|0;i=l;return v|0}else if((j|0)==37){v=Mb(-1,-1,0)|0;nd(v);return 0}else if((j|0)==38){m=Mb(-1,-1)|0;if((s|0)==0){db(m|0)}y=0,ra(44,s|0)|0;if(!y){db(m|0)}else{y=0;v=Mb(-1,-1,0)|0;nd(v);return 0}}else if((j|0)==48){o=c[g>>2]|0;break}else if((j|0)==50){i=l;return f|0}}}while(0);v=(o|0)!=(f|0)|0;i=l;return v|0}function pn(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;h=i;i=i+8|0;c[g>>2]=e;e=h|0;b=_b(c[b+8>>2]|0)|0;j=(y=0,ta(12,e|0,0,d|0)|0);if(y){y=0;d=Mb(-1,-1)|0;if((b|0)==0){db(d|0)}y=0,ra(44,b|0)|0;if(!y){db(d|0)}else{y=0;j=Mb(-1,-1,0)|0;nd(j);return 0}}do{if((b|0)!=0){y=0,ra(44,b|0)|0;if(!y){break}else{y=0}j=Mb(-1,-1,0)|0;nd(j);return 0}}while(0);if((j|0)==(-1|0)|(j|0)==0){j=2;i=h;return j|0}d=j-1|0;b=c[g>>2]|0;if(d>>>0>(f-b|0)>>>0){j=1;i=h;return j|0}if((d|0)==0){j=0;i=h;return j|0}else{f=d}while(1){j=a[e]|0;c[g>>2]=b+1;a[b]=j;f=f-1|0;if((f|0)==0){g=0;break}e=e+1|0;b=c[g>>2]|0}i=h;return g|0}function qn(a){a=a|0;var b=0,d=0;d=a+8|0;a=(y=0,ra(44,c[d>>2]|0)|0);do{if(!y){b=(y=0,ta(24,0,0,4)|0);if(y){y=0;b=Mb(-1,-1,0)|0;if((a|0)==0){d=b;nd(d);return 0}y=0,ra(44,a|0)|0;if(!y){d=b;nd(d);return 0}else{y=0;d=Mb(-1,-1,0)|0;nd(d);return 0}}do{if((a|0)!=0){y=0,ra(44,a|0)|0;if(!y){break}else{y=0}d=Mb(-1,-1,0)|0;nd(d);return 0}}while(0);if((b|0)!=0){d=-1;return d|0}a=c[d>>2]|0;if((a|0)==0){d=1;return d|0}a=(y=0,ra(44,a|0)|0);if(y){y=0;break}if((a|0)==0){d=0;return d|0}y=0,ra(44,a|0)|0;if(!y){d=0;return d|0}else{y=0;d=Mb(-1,-1,0)|0;nd(d);return 0}}else{y=0}}while(0);d=Mb(-1,-1,0)|0;nd(d);return 0}function rn(a){a=a|0;return 0}function sn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;if((f|0)==0|(d|0)==(e|0)){k=0;return k|0}g=e;a=a+8|0;i=0;h=0;while(1){j=_b(c[a>>2]|0)|0;k=(y=0,ta(2,d|0,g-d|0,b|0)|0);if(y){y=0;g=7;break}if((j|0)!=0){y=0,ra(44,j|0)|0;if(y){y=0;g=6;break}}if((k|0)==0){j=1;d=d+1|0}else if((k|0)==(-1|0)|(k|0)==(-2|0)){g=15;break}else{j=k;d=d+k|0}i=j+i|0;h=h+1|0;if(h>>>0>=f>>>0|(d|0)==(e|0)){g=15;break}}if((g|0)==6){k=Mb(-1,-1,0)|0;nd(k);return 0}else if((g|0)==7){g=Mb(-1,-1)|0;if((j|0)==0){db(g|0)}y=0,ra(44,j|0)|0;if(!y){db(g|0)}else{y=0;k=Mb(-1,-1,0)|0;nd(k);return 0}}else if((g|0)==15){return i|0}return 0}function tn(a){a=a|0;a=c[a+8>>2]|0;if((a|0)==0){a=1;return a|0}a=(y=0,ra(44,a|0)|0);if(y){y=0;a=Mb(-1,-1,0)|0;nd(a);return 0}if((a|0)==0){a=4;return a|0}y=0,ra(44,a|0)|0;if(!y){a=4;return a|0}else{y=0;a=Mb(-1,-1,0)|0;nd(a);return 0}return 0}function un(a){a=a|0;vg(a|0);xp(a);return}function vn(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;a=i;i=i+16|0;l=a|0;k=a+8|0;c[l>>2]=d;c[k>>2]=g;b=wn(d,e,l,g,h,k,1114111,0)|0;c[f>>2]=d+((c[l>>2]|0)-d>>1<<1);c[j>>2]=g+((c[k>>2]|0)-g);i=a;return b|0}function wn(d,f,g,h,i,j,k,l){d=d|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0;c[g>>2]=d;c[j>>2]=h;do{if((l&2|0)!=0){if((i-h|0)<3){n=1;return n|0}else{c[j>>2]=h+1;a[h]=-17;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=-69;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=-65;break}}}while(0);h=f;m=c[g>>2]|0;if(m>>>0>=f>>>0){n=0;return n|0}a:while(1){d=b[m>>1]|0;l=d&65535;if(l>>>0>k>>>0){f=2;k=26;break}do{if((d&65535)>>>0<128>>>0){l=c[j>>2]|0;if((i-l|0)<1){f=1;k=26;break a}c[j>>2]=l+1;a[l]=d}else{if((d&65535)>>>0<2048>>>0){d=c[j>>2]|0;if((i-d|0)<2){f=1;k=26;break a}c[j>>2]=d+1;a[d]=l>>>6|192;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l&63|128;break}if((d&65535)>>>0<55296>>>0){d=c[j>>2]|0;if((i-d|0)<3){f=1;k=26;break a}c[j>>2]=d+1;a[d]=l>>>12|224;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l>>>6&63|128;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l&63|128;break}if((d&65535)>>>0>=56320>>>0){if((d&65535)>>>0<57344>>>0){f=2;k=26;break a}d=c[j>>2]|0;if((i-d|0)<3){f=1;k=26;break a}c[j>>2]=d+1;a[d]=l>>>12|224;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l>>>6&63|128;n=c[j>>2]|0;c[j>>2]=n+1;a[n]=l&63|128;break}if((h-m|0)<4){f=1;k=26;break a}d=m+2|0;n=e[d>>1]|0;if((n&64512|0)!=56320){f=2;k=26;break a}if((i-(c[j>>2]|0)|0)<4){f=1;k=26;break a}m=l&960;if(((m<<10)+65536|l<<10&64512|n&1023)>>>0>k>>>0){f=2;k=26;break a}c[g>>2]=d;d=(m>>>6)+1|0;m=c[j>>2]|0;c[j>>2]=m+1;a[m]=d>>>2|240;m=c[j>>2]|0;c[j>>2]=m+1;a[m]=l>>>2&15|d<<4&48|128;m=c[j>>2]|0;c[j>>2]=m+1;a[m]=l<<4&48|n>>>6&15|128;m=c[j>>2]|0;c[j>>2]=m+1;a[m]=n&63|128}}while(0);m=(c[g>>2]|0)+2|0;c[g>>2]=m;if(m>>>0>=f>>>0){f=0;k=26;break}}if((k|0)==26){return f|0}return 0}function xn(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;a=i;i=i+16|0;l=a|0;k=a+8|0;c[l>>2]=d;c[k>>2]=g;b=yn(d,e,l,g,h,k,1114111,0)|0;c[f>>2]=d+((c[l>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>1<<1);i=a;return b|0}function yn(e,f,g,h,i,j,k,l){e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0;c[g>>2]=e;c[j>>2]=h;n=c[g>>2]|0;do{if((l&4|0)!=0){if((f-n|0)<=2){break}if((a[n]|0)!=-17){break}if((a[n+1|0]|0)!=-69){break}if((a[n+2|0]|0)!=-65){break}n=n+3|0;c[g>>2]=n}}while(0);a:do{if(n>>>0<f>>>0){e=f;l=i;h=c[j>>2]|0;b:while(1){if(h>>>0>=i>>>0){break a}o=a[n]|0;m=o&255;if(m>>>0>k>>>0){f=2;k=41;break}do{if(o<<24>>24>-1){b[h>>1]=o&255;c[g>>2]=(c[g>>2]|0)+1}else{if((o&255)>>>0<194>>>0){f=2;k=41;break b}if((o&255)>>>0<224>>>0){if((e-n|0)<2){f=1;k=41;break b}n=d[n+1|0]|0;if((n&192|0)!=128){f=2;k=41;break b}m=n&63|m<<6&1984;if(m>>>0>k>>>0){f=2;k=41;break b}b[h>>1]=m;c[g>>2]=(c[g>>2]|0)+2;break}if((o&255)>>>0<240>>>0){if((e-n|0)<3){f=1;k=41;break b}o=a[n+1|0]|0;n=a[n+2|0]|0;if((m|0)==224){if((o&-32)<<24>>24!=-96){f=2;k=41;break b}}else if((m|0)==237){if((o&-32)<<24>>24!=-128){f=2;k=41;break b}}else{if((o&-64)<<24>>24!=-128){f=2;k=41;break b}}n=n&255;if((n&192|0)!=128){f=2;k=41;break b}m=(o&255)<<6&4032|m<<12|n&63;if((m&65535)>>>0>k>>>0){f=2;k=41;break b}b[h>>1]=m;c[g>>2]=(c[g>>2]|0)+3;break}if((o&255)>>>0>=245>>>0){f=2;k=41;break b}if((e-n|0)<4){f=1;k=41;break b}o=a[n+1|0]|0;p=a[n+2|0]|0;q=a[n+3|0]|0;if((m|0)==240){if((o+112&255)>>>0>=48>>>0){f=2;k=41;break b}}else if((m|0)==244){if((o&-16)<<24>>24!=-128){f=2;k=41;break b}}else{if((o&-64)<<24>>24!=-128){f=2;k=41;break b}}n=p&255;if((n&192|0)!=128){f=2;k=41;break b}p=q&255;if((p&192|0)!=128){f=2;k=41;break b}if((l-h|0)<4){f=1;k=41;break b}m=m&7;q=o&255;o=n<<6;p=p&63;if((q<<12&258048|m<<18|o&4032|p)>>>0>k>>>0){f=2;k=41;break b}b[h>>1]=q<<2&60|n>>>4&3|((q>>>4&3|m<<2)<<6)+16320|55296;q=(c[j>>2]|0)+2|0;c[j>>2]=q;b[q>>1]=p|o&960|56320;c[g>>2]=(c[g>>2]|0)+4}}while(0);h=(c[j>>2]|0)+2|0;c[j>>2]=h;n=c[g>>2]|0;if(n>>>0>=f>>>0){break a}}if((k|0)==41){return f|0}}}while(0);q=n>>>0<f>>>0|0;return q|0}function zn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function An(a){a=a|0;return 0}function Bn(a){a=a|0;return 0}function Cn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Dn(c,d,e,1114111,0)|0}function Dn(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;do{if((g&4|0)==0){i=b}else{if((c-b|0)<=2){i=b;break}if((a[b]|0)!=-17){i=b;break}if((a[b+1|0]|0)!=-69){i=b;break}i=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);a:do{if(i>>>0<c>>>0&(e|0)!=0){g=c;h=0;b:while(1){k=a[i]|0;j=k&255;if(j>>>0>f>>>0){break a}do{if(k<<24>>24>-1){i=i+1|0}else{if((k&255)>>>0<194>>>0){break a}if((k&255)>>>0<224>>>0){if((g-i|0)<2){break a}k=d[i+1|0]|0;if((k&192|0)!=128){break a}if((k&63|j<<6&1984)>>>0>f>>>0){break a}i=i+2|0;break}if((k&255)>>>0<240>>>0){l=i;if((g-l|0)<3){break a}k=a[i+1|0]|0;m=a[i+2|0]|0;if((j|0)==224){if((k&-32)<<24>>24!=-96){e=21;break b}}else if((j|0)==237){if((k&-32)<<24>>24!=-128){e=23;break b}}else{if((k&-64)<<24>>24!=-128){e=25;break b}}l=m&255;if((l&192|0)!=128){break a}if(((k&255)<<6&4032|j<<12&61440|l&63)>>>0>f>>>0){break a}i=i+3|0;break}if((k&255)>>>0>=245>>>0){break a}m=i;if((g-m|0)<4){break a}if((e-h|0)>>>0<2>>>0){break a}k=a[i+1|0]|0;n=a[i+2|0]|0;l=a[i+3|0]|0;if((j|0)==244){if((k&-16)<<24>>24!=-128){e=36;break b}}else if((j|0)==240){if((k+112&255)>>>0>=48>>>0){e=34;break b}}else{if((k&-64)<<24>>24!=-128){e=38;break b}}m=n&255;if((m&192|0)!=128){break a}l=l&255;if((l&192|0)!=128){break a}if(((k&255)<<12&258048|j<<18&1835008|m<<6&4032|l&63)>>>0>f>>>0){break a}i=i+4|0;h=h+1|0}}while(0);h=h+1|0;if(!(i>>>0<c>>>0&h>>>0<e>>>0)){break a}}if((e|0)==21){n=l-b|0;return n|0}else if((e|0)==23){n=l-b|0;return n|0}else if((e|0)==25){n=l-b|0;return n|0}else if((e|0)==34){n=m-b|0;return n|0}else if((e|0)==36){n=m-b|0;return n|0}else if((e|0)==38){n=m-b|0;return n|0}}}while(0);n=i-b|0;return n|0}function En(a){a=a|0;return 4}function Fn(a){a=a|0;vg(a|0);xp(a);return}function Gn(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;a=i;i=i+16|0;l=a|0;k=a+8|0;c[l>>2]=d;c[k>>2]=g;b=Hn(d,e,l,g,h,k,1114111,0)|0;c[f>>2]=d+((c[l>>2]|0)-d>>2<<2);c[j>>2]=g+((c[k>>2]|0)-g);i=a;return b|0}function Hn(b,d,e,f,g,h,i,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;c[e>>2]=b;c[h>>2]=f;do{if((j&2|0)!=0){if((g-f|0)<3){b=1;return b|0}else{c[h>>2]=f+1;a[f]=-17;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-69;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=-65;break}}}while(0);j=c[e>>2]|0;if(j>>>0>=d>>>0){b=0;return b|0}a:while(1){j=c[j>>2]|0;if((j&-2048|0)==55296|j>>>0>i>>>0){i=2;e=19;break}do{if(j>>>0<128>>>0){f=c[h>>2]|0;if((g-f|0)<1){i=1;e=19;break a}c[h>>2]=f+1;a[f]=j}else{if(j>>>0<2048>>>0){f=c[h>>2]|0;if((g-f|0)<2){i=1;e=19;break a}c[h>>2]=f+1;a[f]=j>>>6|192;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j&63|128;break}f=c[h>>2]|0;b=g-f|0;if(j>>>0<65536>>>0){if((b|0)<3){i=1;e=19;break a}c[h>>2]=f+1;a[f]=j>>>12|224;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j>>>6&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j&63|128;break}else{if((b|0)<4){i=1;e=19;break a}c[h>>2]=f+1;a[f]=j>>>18|240;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j>>>12&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j>>>6&63|128;b=c[h>>2]|0;c[h>>2]=b+1;a[b]=j&63|128;break}}}while(0);j=(c[e>>2]|0)+4|0;c[e>>2]=j;if(j>>>0>=d>>>0){i=0;e=19;break}}if((e|0)==19){return i|0}return 0}function In(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;a=i;i=i+16|0;l=a|0;k=a+8|0;c[l>>2]=d;c[k>>2]=g;b=Jn(d,e,l,g,h,k,1114111,0)|0;c[f>>2]=d+((c[l>>2]|0)-d);c[j>>2]=g+((c[k>>2]|0)-g>>2<<2);i=a;return b|0}function Jn(b,e,f,g,h,i,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0;c[f>>2]=b;c[i>>2]=g;m=c[f>>2]|0;do{if((k&4|0)!=0){if((e-m|0)<=2){break}if((a[m]|0)!=-17){break}if((a[m+1|0]|0)!=-69){break}if((a[m+2|0]|0)!=-65){break}m=m+3|0;c[f>>2]=m}}while(0);a:do{if(m>>>0<e>>>0){k=e;g=c[i>>2]|0;b:while(1){if(g>>>0>=h>>>0){break a}l=a[m]|0;b=l&255;do{if(l<<24>>24>-1){if(b>>>0>j>>>0){e=2;j=40;break b}c[g>>2]=b;c[f>>2]=(c[f>>2]|0)+1}else{if((l&255)>>>0<194>>>0){e=2;j=40;break b}if((l&255)>>>0<224>>>0){if((k-m|0)<2){e=1;j=40;break b}l=d[m+1|0]|0;if((l&192|0)!=128){e=2;j=40;break b}b=l&63|b<<6&1984;if(b>>>0>j>>>0){e=2;j=40;break b}c[g>>2]=b;c[f>>2]=(c[f>>2]|0)+2;break}if((l&255)>>>0<240>>>0){if((k-m|0)<3){e=1;j=40;break b}l=a[m+1|0]|0;m=a[m+2|0]|0;if((b|0)==224){if((l&-32)<<24>>24!=-96){e=2;j=40;break b}}else if((b|0)==237){if((l&-32)<<24>>24!=-128){e=2;j=40;break b}}else{if((l&-64)<<24>>24!=-128){e=2;j=40;break b}}m=m&255;if((m&192|0)!=128){e=2;j=40;break b}b=(l&255)<<6&4032|b<<12&61440|m&63;if(b>>>0>j>>>0){e=2;j=40;break b}c[g>>2]=b;c[f>>2]=(c[f>>2]|0)+3;break}if((l&255)>>>0>=245>>>0){e=2;j=40;break b}if((k-m|0)<4){e=1;j=40;break b}l=a[m+1|0]|0;n=a[m+2|0]|0;m=a[m+3|0]|0;if((b|0)==240){if((l+112&255)>>>0>=48>>>0){e=2;j=40;break b}}else if((b|0)==244){if((l&-16)<<24>>24!=-128){e=2;j=40;break b}}else{if((l&-64)<<24>>24!=-128){e=2;j=40;break b}}n=n&255;if((n&192|0)!=128){e=2;j=40;break b}m=m&255;if((m&192|0)!=128){e=2;j=40;break b}b=(l&255)<<12&258048|b<<18&1835008|n<<6&4032|m&63;if(b>>>0>j>>>0){e=2;j=40;break b}c[g>>2]=b;c[f>>2]=(c[f>>2]|0)+4}}while(0);g=(c[i>>2]|0)+4|0;c[i>>2]=g;m=c[f>>2]|0;if(m>>>0>=e>>>0){break a}}if((j|0)==40){return e|0}}}while(0);n=m>>>0<e>>>0|0;return n|0}function Kn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;c[f>>2]=d;return 3}function Ln(a){a=a|0;return 0}function Mn(a){a=a|0;return 0}function Nn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return On(c,d,e,1114111,0)|0}function On(b,c,e,f,g){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;do{if((g&4|0)==0){i=b}else{if((c-b|0)<=2){i=b;break}if((a[b]|0)!=-17){i=b;break}if((a[b+1|0]|0)!=-69){i=b;break}i=(a[b+2|0]|0)==-65?b+3|0:b}}while(0);a:do{if(i>>>0<c>>>0&(e|0)!=0){h=c;g=1;b:while(1){k=a[i]|0;j=k&255;do{if(k<<24>>24>-1){if(j>>>0>f>>>0){break a}i=i+1|0}else{if((k&255)>>>0<194>>>0){break a}if((k&255)>>>0<224>>>0){if((h-i|0)<2){break a}k=d[i+1|0]|0;if((k&192|0)!=128){break a}if((k&63|j<<6&1984)>>>0>f>>>0){break a}i=i+2|0;break}if((k&255)>>>0<240>>>0){k=i;if((h-k|0)<3){break a}l=a[i+1|0]|0;m=a[i+2|0]|0;if((j|0)==224){if((l&-32)<<24>>24!=-96){e=21;break b}}else if((j|0)==237){if((l&-32)<<24>>24!=-128){e=23;break b}}else{if((l&-64)<<24>>24!=-128){e=25;break b}}k=m&255;if((k&192|0)!=128){break a}if(((l&255)<<6&4032|j<<12&61440|k&63)>>>0>f>>>0){break a}i=i+3|0;break}if((k&255)>>>0>=245>>>0){break a}m=i;if((h-m|0)<4){break a}k=a[i+1|0]|0;n=a[i+2|0]|0;l=a[i+3|0]|0;if((j|0)==240){if((k+112&255)>>>0>=48>>>0){e=33;break b}}else if((j|0)==244){if((k&-16)<<24>>24!=-128){e=35;break b}}else{if((k&-64)<<24>>24!=-128){e=37;break b}}m=n&255;if((m&192|0)!=128){break a}l=l&255;if((l&192|0)!=128){break a}if(((k&255)<<12&258048|j<<18&1835008|m<<6&4032|l&63)>>>0>f>>>0){break a}i=i+4|0}}while(0);if(!(i>>>0<c>>>0&g>>>0<e>>>0)){break a}g=g+1|0}if((e|0)==21){n=k-b|0;return n|0}else if((e|0)==23){n=k-b|0;return n|0}else if((e|0)==25){n=k-b|0;return n|0}else if((e|0)==33){n=m-b|0;return n|0}else if((e|0)==35){n=m-b|0;return n|0}else if((e|0)==37){n=m-b|0;return n|0}}}while(0);n=i-b|0;return n|0}function Pn(a){a=a|0;return 4}function Qn(a){a=a|0;vg(a|0);xp(a);return}function Rn(a){a=a|0;vg(a|0);xp(a);return}function Sn(a){a=a|0;c[a>>2]=20192;Yg(a+12|0);vg(a|0);xp(a);return}function Tn(a){a=a|0;c[a>>2]=20192;Yg(a+12|0);vg(a|0);return}function Un(a){a=a|0;c[a>>2]=20144;Yg(a+16|0);vg(a|0);xp(a);return}function Vn(a){a=a|0;c[a>>2]=20144;Yg(a+16|0);vg(a|0);return}function Wn(b){b=b|0;return a[b+8|0]|0}function Xn(a){a=a|0;return c[a+8>>2]|0}function Yn(b){b=b|0;return a[b+9|0]|0}function Zn(a){a=a|0;return c[a+12>>2]|0}function _n(a,b){a=a|0;b=b|0;Vg(a,b+12|0);return}function $n(a,b){a=a|0;b=b|0;Vg(a,b+16|0);return}function ao(a,b){a=a|0;b=b|0;Wg(a,15464,4);return}function bo(a,b){a=a|0;b=b|0;hh(a,15352,So(15352)|0);return}function co(a,b){a=a|0;b=b|0;Wg(a,15296,5);return}function eo(a,b){a=a|0;b=b|0;hh(a,15152,So(15152)|0);return}function fo(b){b=b|0;if((a[31504]|0)!=0){b=c[7476]|0;return b|0}if((xb(31504)|0)==0){b=c[7476]|0;return b|0}do{if((a[31392]|0)==0){if((xb(31392)|0)==0){break}Pp(28832,0,168)|0;jb(298,0,v|0)|0}}while(0);y=0,Da(28,28832,17536)|0;do{if(!y){y=0,Da(28,28844,17528)|0;if(y){y=0;break}y=0,Da(28,28856,17520)|0;if(y){y=0;break}y=0,Da(28,28868,17424)|0;if(y){y=0;break}y=0,Da(28,28880,17408)|0;if(y){y=0;break}y=0,Da(28,28892,17400)|0;if(y){y=0;break}y=0,Da(28,28904,17384)|0;if(y){y=0;break}y=0,Da(28,28916,17376)|0;if(y){y=0;break}y=0,Da(28,28928,17328)|0;if(y){y=0;break}y=0,Da(28,28940,17280)|0;if(y){y=0;break}y=0,Da(28,28952,17272)|0;if(y){y=0;break}y=0,Da(28,28964,17248)|0;if(y){y=0;break}y=0,Da(28,28976,17216)|0;if(y){y=0;break}y=0,Da(28,28988,17208)|0;if(y){y=0;break}c[7476]=28832;b=c[7476]|0;return b|0}else{y=0}}while(0);b=Mb(-1,-1)|0;db(b|0);return 0}function go(b){b=b|0;if((a[31448]|0)!=0){b=c[7454]|0;return b|0}if((xb(31448)|0)==0){b=c[7454]|0;return b|0}do{if((a[31368]|0)==0){if((xb(31368)|0)==0){break}Pp(28088,0,168)|0;jb(168,0,v|0)|0}}while(0);y=0,Da(36,28088,18200)|0;do{if(!y){y=0,Da(36,28100,18168)|0;if(y){y=0;break}y=0,Da(36,28112,18104)|0;if(y){y=0;break}y=0,Da(36,28124,18064)|0;if(y){y=0;break}y=0,Da(36,28136,18016)|0;if(y){y=0;break}y=0,Da(36,28148,17984)|0;if(y){y=0;break}y=0,Da(36,28160,17944)|0;if(y){y=0;break}y=0,Da(36,28172,17888)|0;if(y){y=0;break}y=0,Da(36,28184,17784)|0;if(y){y=0;break}y=0,Da(36,28196,17728)|0;if(y){y=0;break}y=0,Da(36,28208,17712)|0;if(y){y=0;break}y=0,Da(36,28220,17696)|0;if(y){y=0;break}y=0,Da(36,28232,17624)|0;if(y){y=0;break}y=0,Da(36,28244,17608)|0;if(y){y=0;break}c[7454]=28088;b=c[7454]|0;return b|0}else{y=0}}while(0);b=Mb(-1,-1)|0;db(b|0);return 0}function ho(b){b=b|0;if((a[31496]|0)!=0){b=c[7474]|0;return b|0}if((xb(31496)|0)==0){b=c[7474]|0;return b|0}do{if((a[31384]|0)==0){if((xb(31384)|0)==0){break}Pp(28544,0,288)|0;jb(186,0,v|0)|0}}while(0);y=0,Da(28,28544,11848)|0;do{if(!y){y=0,Da(28,28556,11832)|0;if(y){y=0;break}y=0,Da(28,28568,11784)|0;if(y){y=0;break}y=0,Da(28,28580,11752)|0;if(y){y=0;break}y=0,Da(28,28592,11744)|0;if(y){y=0;break}y=0,Da(28,28604,11736)|0;if(y){y=0;break}y=0,Da(28,28616,11728)|0;if(y){y=0;break}y=0,Da(28,28628,11720)|0;if(y){y=0;break}y=0,Da(28,28640,11624)|0;if(y){y=0;break}y=0,Da(28,28652,11616)|0;if(y){y=0;break}y=0,Da(28,28664,11584)|0;if(y){y=0;break}y=0,Da(28,28676,11568)|0;if(y){y=0;break}y=0,Da(28,28688,11520)|0;if(y){y=0;break}y=0,Da(28,28700,11512)|0;if(y){y=0;break}y=0,Da(28,28712,11464)|0;if(y){y=0;break}y=0,Da(28,28724,11456)|0;if(y){y=0;break}y=0,Da(28,28736,11744)|0;if(y){y=0;break}y=0,Da(28,28748,11416)|0;if(y){y=0;break}y=0,Da(28,28760,11408)|0;if(y){y=0;break}y=0,Da(28,28772,18344)|0;if(y){y=0;break}y=0,Da(28,28784,18336)|0;if(y){y=0;break}y=0,Da(28,28796,18328)|0;if(y){y=0;break}y=0,Da(28,28808,18320)|0;if(y){y=0;break}y=0,Da(28,28820,18232)|0;if(y){y=0;break}c[7474]=28544;b=c[7474]|0;return b|0}else{y=0}}while(0);b=Mb(-1,-1)|0;db(b|0);return 0}function io(b){b=b|0;if((a[31440]|0)!=0){b=c[7452]|0;return b|0}if((xb(31440)|0)==0){b=c[7452]|0;return b|0}do{if((a[31360]|0)==0){if((xb(31360)|0)==0){break}Pp(27800,0,288)|0;jb(142,0,v|0)|0}}while(0);y=0,Da(36,27800,13008)|0;do{if(!y){y=0,Da(36,27812,12952)|0;if(y){y=0;break}y=0,Da(36,27824,12912)|0;if(y){y=0;break}y=0,Da(36,27836,12880)|0;if(y){y=0;break}y=0,Da(36,27848,12168)|0;if(y){y=0;break}y=0,Da(36,27860,12768)|0;if(y){y=0;break}y=0,Da(36,27872,12728)|0;if(y){y=0;break}y=0,Da(36,27884,12648)|0;if(y){y=0;break}y=0,Da(36,27896,12568)|0;if(y){y=0;break}y=0,Da(36,27908,12528)|0;if(y){y=0;break}y=0,Da(36,27920,12440)|0;if(y){y=0;break}y=0,Da(36,27932,12360)|0;if(y){y=0;break}y=0,Da(36,27944,12288)|0;if(y){y=0;break}y=0,Da(36,27956,12272)|0;if(y){y=0;break}y=0,Da(36,27968,12200)|0;if(y){y=0;break}y=0,Da(36,27980,12184)|0;if(y){y=0;break}y=0,Da(36,27992,12168)|0;if(y){y=0;break}y=0,Da(36,28004,12064)|0;if(y){y=0;break}y=0,Da(36,28016,12032)|0;if(y){y=0;break}y=0,Da(36,28028,12016)|0;if(y){y=0;break}y=0,Da(36,28040,12e3)|0;if(y){y=0;break}y=0,Da(36,28052,11952)|0;if(y){y=0;break}y=0,Da(36,28064,11936)|0;if(y){y=0;break}y=0,Da(36,28076,11872)|0;if(y){y=0;break}c[7452]=27800;b=c[7452]|0;return b|0}else{y=0}}while(0);b=Mb(-1,-1)|0;db(b|0);return 0}function jo(b){b=b|0;if((a[31512]|0)!=0){b=c[7478]|0;return b|0}if((xb(31512)|0)==0){b=c[7478]|0;return b|0}do{if((a[31400]|0)==0){if((xb(31400)|0)==0){break}Pp(29e3,0,288)|0;jb(140,0,v|0)|0}}while(0);y=0,Da(28,29e3,13168)|0;if(y){y=0;b=Mb(-1,-1)|0;db(b|0)}y=0,Da(28,29012,13112)|0;if(y){y=0;b=Mb(-1,-1)|0;db(b|0)}c[7478]=29e3;b=c[7478]|0;return b|0}function ko(b){b=b|0;if((a[31456]|0)!=0){b=c[7456]|0;return b|0}if((xb(31456)|0)==0){b=c[7456]|0;return b|0}do{if((a[31376]|0)==0){if((xb(31376)|0)==0){break}Pp(28256,0,288)|0;jb(270,0,v|0)|0}}while(0);y=0,Da(36,28256,13288)|0;if(y){y=0;b=Mb(-1,-1)|0;db(b|0)}y=0,Da(36,28268,13240)|0;if(y){y=0;b=Mb(-1,-1)|0;db(b|0)}c[7456]=28256;b=c[7456]|0;return b|0}function lo(b){b=b|0;if((a[31520]|0)!=0){return 29920}if((xb(31520)|0)==0){return 29920}y=0;Ha(30,29920,14968,8);if(y){y=0;b=Mb(-1,-1)|0;db(b|0)}jb(290,29920,v|0)|0;return 29920}function mo(b){b=b|0;var c=0;if((a[31464]|0)!=0){return 29832}if((xb(31464)|0)==0){return 29832}b=(y=0,ra(74,14832)|0);if(y){y=0;c=Mb(-1,-1)|0;db(c|0)}y=0;Ha(20,29832,14832,b|0);if(y){y=0;c=Mb(-1,-1)|0;db(c|0)}jb(216,29832,v|0)|0;return 29832}function no(b){b=b|0;if((a[31544]|0)!=0){return 29968}if((xb(31544)|0)==0){return 29968}y=0;Ha(30,29968,14728,8);if(y){y=0;b=Mb(-1,-1)|0;db(b|0)}jb(290,29968,v|0)|0;return 29968}function oo(b){b=b|0;var c=0;if((a[31488]|0)!=0){return 29880}if((xb(31488)|0)==0){return 29880}b=(y=0,ra(74,14640)|0);if(y){y=0;c=Mb(-1,-1)|0;db(c|0)}y=0;Ha(20,29880,14640,b|0);if(y){y=0;c=Mb(-1,-1)|0;db(c|0)}jb(216,29880,v|0)|0;return 29880}function po(b){b=b|0;if((a[31536]|0)!=0){return 29952}if((xb(31536)|0)==0){return 29952}y=0;Ha(30,29952,14496,20);if(y){y=0;b=Mb(-1,-1)|0;db(b|0)}jb(290,29952,v|0)|0;return 29952}function qo(b){b=b|0;var c=0;if((a[31480]|0)!=0){return 29864}if((xb(31480)|0)==0){return 29864}b=(y=0,ra(74,14296)|0);if(y){y=0;c=Mb(-1,-1)|0;db(c|0)}y=0;Ha(20,29864,14296,b|0);if(y){y=0;c=Mb(-1,-1)|0;db(c|0)}jb(216,29864,v|0)|0;return 29864}function ro(b){b=b|0;if((a[31528]|0)!=0){return 29936}if((xb(31528)|0)==0){return 29936}y=0;Ha(30,29936,14224,11);if(y){y=0;b=Mb(-1,-1)|0;db(b|0)}jb(290,29936,v|0)|0;return 29936}function so(b){b=b|0;var c=0;if((a[31472]|0)!=0){return 29848}if((xb(31472)|0)==0){return 29848}b=(y=0,ra(74,14176)|0);if(y){y=0;c=Mb(-1,-1)|0;db(c|0)}y=0;Ha(20,29848,14176,b|0);if(y){y=0;c=Mb(-1,-1)|0;db(c|0)}jb(216,29848,v|0)|0;return 29848}function to(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0.0,l=0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}j=Ub()|0;h=c[j>>2]|0;c[j>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);k=+Lp(b,g,c[7330]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=h}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}if((b|0)!=34){i=f;return+k}c[e>>2]=4;i=f;return+k}function uo(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0.0,l=0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}j=Ub()|0;h=c[j>>2]|0;c[j>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);k=+Lp(b,g,c[7330]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=h}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}if((b|0)!=34){i=f;return+k}c[e>>2]=4;i=f;return+k}function vo(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0.0,l=0;f=i;i=i+8|0;g=f|0;if((b|0)==(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}j=Ub()|0;h=c[j>>2]|0;c[j>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);k=+Lp(b,g,c[7330]|0);b=c[j>>2]|0;if((b|0)==0){c[j>>2]=h}if((c[g>>2]|0)!=(d|0)){c[e>>2]=4;k=0.0;i=f;return+k}if((b|0)==34){c[e>>2]=4}i=f;return+k}function wo(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;do{if((b|0)==(d|0)){c[e>>2]=4;e=0;b=0}else{if((a[b]|0)==45){c[e>>2]=4;e=0;b=0;break}k=Ub()|0;j=c[k>>2]|0;c[k>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);b=Ra(b|0,h|0,f|0,c[7330]|0)|0;f=c[k>>2]|0;if((f|0)==0){c[k>>2]=j}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;e=0;b=0;break}if((f|0)!=34){e=L;break}c[e>>2]=4;e=-1;b=-1}}while(0);i=g;return(L=e,b)|0}function xo(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;k=i;i=i+8|0;h=k|0;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=k;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=k;return l|0}j=Ub()|0;g=c[j>>2]|0;c[j>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);l=Ra(b|0,h|0,f|0,c[7330]|0)|0;b=L;f=c[j>>2]|0;if((f|0)==0){c[j>>2]=g}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=k;return l|0}d=0;if((f|0)==34|(b>>>0>d>>>0|b>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;l=-1;i=k;return l|0}else{i=k;return l|0}return 0}function yo(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;k=i;i=i+8|0;h=k|0;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=k;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=k;return l|0}j=Ub()|0;g=c[j>>2]|0;c[j>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);l=Ra(b|0,h|0,f|0,c[7330]|0)|0;b=L;f=c[j>>2]|0;if((f|0)==0){c[j>>2]=g}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=k;return l|0}d=0;if((f|0)==34|(b>>>0>d>>>0|b>>>0==d>>>0&l>>>0>-1>>>0)){c[e>>2]=4;l=-1;i=k;return l|0}else{i=k;return l|0}return 0}function zo(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;k=i;i=i+8|0;h=k|0;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=k;return l|0}if((a[b]|0)==45){c[e>>2]=4;l=0;i=k;return l|0}j=Ub()|0;g=c[j>>2]|0;c[j>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);l=Ra(b|0,h|0,f|0,c[7330]|0)|0;b=L;f=c[j>>2]|0;if((f|0)==0){c[j>>2]=g}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=k;return l|0}d=0;if((f|0)==34|(b>>>0>d>>>0|b>>>0==d>>>0&l>>>0>65535>>>0)){c[e>>2]=4;l=-1;i=k;return l|0}else{l=l&65535;i=k;return l|0}return 0}function Ao(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;j=g|0;if((b|0)==(d|0)){c[e>>2]=4;b=0;l=0;i=g;return(L=b,l)|0}h=Ub()|0;k=c[h>>2]|0;c[h>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);b=gc(b|0,j|0,f|0,c[7330]|0)|0;f=L;l=c[h>>2]|0;if((l|0)==0){c[h>>2]=k}if((c[j>>2]|0)!=(d|0)){c[e>>2]=4;b=0;l=0;i=g;return(L=b,l)|0}if((l|0)!=34){l=b;i=g;return(L=f,l)|0}c[e>>2]=4;h=0;h=(f|0)>(h|0)|(f|0)==(h|0)&b>>>0>0>>>0;j=h?2147483647:-2147483648;l=h?-1:0;i=g;return(L=j,l)|0}function Bo(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;k=i;i=i+8|0;h=k|0;if((b|0)==(d|0)){c[e>>2]=4;l=0;i=k;return l|0}j=Ub()|0;g=c[j>>2]|0;c[j>>2]=0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}l=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=l;break}else{y=0;l=Mb(-1,-1)|0;db(l|0)}}}while(0);l=gc(b|0,h|0,f|0,c[7330]|0)|0;b=L;f=c[j>>2]|0;if((f|0)==0){c[j>>2]=g}if((c[h>>2]|0)!=(d|0)){c[e>>2]=4;l=0;i=k;return l|0}d=-1;j=0;if((f|0)==34|((b|0)<(d|0)|(b|0)==(d|0)&l>>>0<-2147483648>>>0)|((b|0)>(j|0)|(b|0)==(j|0)&l>>>0>2147483647>>>0)){c[e>>2]=4;f=0;l=(b|0)>(f|0)|(b|0)==(f|0)&l>>>0>0>>>0?2147483647:-2147483648;i=k;return l|0}else{i=k;return l|0}return 0}function Co(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;e=c[b+4>>2]|0;d=(c[a>>2]|0)+(e>>1)|0;a=d;b=c[b>>2]|0;if((e&1|0)==0){e=b;yc[e&511](a);return}else{e=c[(c[d>>2]|0)+b>>2]|0;yc[e&511](a);return}}function Do(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=b+8|0;e=b+4|0;g=c[e>>2]|0;k=c[f>>2]|0;i=g;if(k-i>>2>>>0>=d>>>0){do{if((g|0)==0){f=0}else{c[g>>2]=0;f=c[e>>2]|0}g=f+4|0;c[e>>2]=g;d=d-1|0;}while((d|0)!=0);return}g=b+16|0;h=b|0;m=c[h>>2]|0;i=i-m>>2;l=i+d|0;if(l>>>0>1073741823>>>0){vm(0)}k=k-m|0;do{if(k>>2>>>0>536870910>>>0){l=1073741823;j=11}else{k=k>>1;l=k>>>0<l>>>0?l:k;if((l|0)==0){k=0;l=0;break}k=b+128|0;if(!((a[k]&1)==0&l>>>0<29>>>0)){j=11;break}a[k]=1;k=g}}while(0);if((j|0)==11){k=vp(l<<2)|0}j=k+(i<<2)|0;do{if((j|0)==0){j=0}else{c[j>>2]=0}j=j+4|0;d=d-1|0;}while((d|0)!=0);d=c[h>>2]|0;n=(c[e>>2]|0)-d|0;m=k+(i-(n>>2)<<2)|0;i=d;Np(m|0,i|0,n)|0;c[h>>2]=m;c[e>>2]=j;c[f>>2]=k+(l<<2);if((d|0)==0){return}if((d|0)==(g|0)){a[b+128|0]=0;return}else{xp(i);return}}function Eo(a){a=a|0;jh(28532);jh(28520);jh(28508);jh(28496);jh(28484);jh(28472);jh(28460);jh(28448);jh(28436);jh(28424);jh(28412);jh(28400);jh(28388);jh(28376);jh(28364);jh(28352);jh(28340);jh(28328);jh(28316);jh(28304);jh(28292);jh(28280);jh(28268);jh(28256);return}function Fo(a){a=a|0;Yg(29276);Yg(29264);Yg(29252);Yg(29240);Yg(29228);Yg(29216);Yg(29204);Yg(29192);Yg(29180);Yg(29168);Yg(29156);Yg(29144);Yg(29132);Yg(29120);Yg(29108);Yg(29096);Yg(29084);Yg(29072);Yg(29060);Yg(29048);Yg(29036);Yg(29024);Yg(29012);Yg(29e3);return}function Go(a){a=a|0;jh(28076);jh(28064);jh(28052);jh(28040);jh(28028);jh(28016);jh(28004);jh(27992);jh(27980);jh(27968);jh(27956);jh(27944);jh(27932);jh(27920);jh(27908);jh(27896);jh(27884);jh(27872);jh(27860);jh(27848);jh(27836);jh(27824);jh(27812);jh(27800);return}function Ho(a){a=a|0;Yg(28820);Yg(28808);Yg(28796);Yg(28784);Yg(28772);Yg(28760);Yg(28748);Yg(28736);Yg(28724);Yg(28712);Yg(28700);Yg(28688);Yg(28676);Yg(28664);Yg(28652);Yg(28640);Yg(28628);Yg(28616);Yg(28604);Yg(28592);Yg(28580);Yg(28568);Yg(28556);Yg(28544);return}function Io(a){a=a|0;jh(28244);jh(28232);jh(28220);jh(28208);jh(28196);jh(28184);jh(28172);jh(28160);jh(28148);jh(28136);jh(28124);jh(28112);jh(28100);jh(28088);return}function Jo(a){a=a|0;Yg(28988);Yg(28976);Yg(28964);Yg(28952);Yg(28940);Yg(28928);Yg(28916);Yg(28904);Yg(28892);Yg(28880);Yg(28868);Yg(28856);Yg(28844);Yg(28832);return}function Ko(a,b,c){a=a|0;b=b|0;c=c|0;return Lo(0,a,b,(c|0)!=0?c:27312)|0}function Lo(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;f=((f|0)==0?27304:f)|0;k=c[f>>2]|0;a:do{if((d|0)==0){if((k|0)==0){e=0}else{break}i=g;return e|0}else{if((b|0)==0){j=h;c[h>>2]=j;h=j}else{h=b}if((e|0)==0){k=-2;i=g;return k|0}do{if((k|0)==0){b=a[d]|0;j=b&255;if(b<<24>>24>-1){c[h>>2]=j;k=b<<24>>24!=0|0;i=g;return k|0}else{b=j-194|0;if(b>>>0>50>>>0){break a}d=d+1|0;k=c[u+(b<<2)>>2]|0;j=e-1|0;break}}else{j=e}}while(0);b:do{if((j|0)!=0){b=a[d]|0;l=(b&255)>>>3;if((l-16|l+(k>>26))>>>0>7>>>0){break a}while(1){d=d+1|0;k=(b&255)-128|k<<6;j=j-1|0;if((k|0)>=0){break}if((j|0)==0){break b}b=a[d]|0;if(((b&255)-128|0)>>>0>63>>>0){break a}}c[f>>2]=0;c[h>>2]=k;l=e-j|0;i=g;return l|0}}while(0);c[f>>2]=k;l=-2;i=g;return l|0}}while(0);c[f>>2]=0;c[(Ub()|0)>>2]=84;l=-1;i=g;return l|0}function Mo(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+1032|0;h=j+1024|0;l=c[b>>2]|0;c[h>>2]=l;g=(a|0)!=0;k=j|0;e=g?e:256;a=g?a:k;a:do{if((l|0)==0|(e|0)==0){k=0}else{m=0;while(1){o=d>>>2;n=o>>>0>=e>>>0;if(!(n|d>>>0>131>>>0)){k=m;break a}l=n?e:o;d=d-l|0;l=No(a,h,l,f)|0;if((l|0)==-1){break}if((a|0)==(k|0)){a=k}else{a=a+(l<<2)|0;e=e-l|0}m=l+m|0;l=c[h>>2]|0;if((l|0)==0|(e|0)==0){k=m;break a}}k=-1;e=0;l=c[h>>2]|0}}while(0);b:do{if((l|0)!=0){if((e|0)==0|(d|0)==0){break}while(1){m=Lo(a,l,d,f)|0;if((m+2|0)>>>0<3>>>0){break}l=(c[h>>2]|0)+m|0;c[h>>2]=l;e=e-1|0;k=k+1|0;if((e|0)==0|(d|0)==(m|0)){break b}else{d=d-m|0;a=a+4|0}}if((m|0)==0){c[h>>2]=0;break}else if((m|0)==(-1|0)){k=-1;break}else{c[f>>2]=0;break}}}while(0);if(!g){i=j;return k|0}c[b>>2]=c[h>>2];i=j;return k|0}function No(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;h=c[e>>2]|0;do{if((g|0)==0){g=5}else{g=g|0;j=c[g>>2]|0;if((j|0)==0){g=5;break}if((b|0)==0){i=f;g=16;break}c[g>>2]=0;i=f;g=36}}while(0);if((g|0)==5){if((b|0)==0){i=f;g=7}else{i=f;g=6}}a:while(1){if((g|0)==6){if((i|0)==0){g=53;break}while(1){g=a[h]|0;do{if(((g&255)-1|0)>>>0<127>>>0){if(!((h&3|0)==0&i>>>0>3>>>0)){j=g;break}while(1){j=c[h>>2]|0;if(((j-16843009|j)&-2139062144|0)!=0){g=30;break}c[b>>2]=j&255;c[b+4>>2]=d[h+1|0]|0;c[b+8>>2]=d[h+2|0]|0;j=h+4|0;k=b+16|0;c[b+12>>2]=d[h+3|0]|0;i=i-4|0;if(i>>>0>3>>>0){b=k;h=j}else{g=31;break}}if((g|0)==30){j=j&255;break}else if((g|0)==31){h=j;b=k;j=a[j]|0;break}}else{j=g}}while(0);g=j&255;if((g-1|0)>>>0>=127>>>0){break}c[b>>2]=g;i=i-1|0;if((i|0)==0){g=53;break a}else{b=b+4|0;h=h+1|0}}g=g-194|0;if(g>>>0>50>>>0){g=47;break}j=c[u+(g<<2)>>2]|0;h=h+1|0;g=36;continue}else if((g|0)==7){g=a[h]|0;do{if(((g&255)-1|0)>>>0<127>>>0){if((h&3|0)!=0){break}g=c[h>>2]|0;if(((g-16843009|g)&-2139062144|0)!=0){g=g&255;break}do{h=h+4|0;i=i-4|0;g=c[h>>2]|0;}while(((g-16843009|g)&-2139062144|0)==0);g=g&255}}while(0);g=g&255;if((g-1|0)>>>0<127>>>0){h=h+1|0;i=i-1|0;g=7;continue}g=g-194|0;if(g>>>0>50>>>0){g=47;break}j=c[u+(g<<2)>>2]|0;h=h+1|0;g=16;continue}else if((g|0)==16){k=(d[h]|0)>>>3;if((k-16|k+(j>>26))>>>0>7>>>0){g=17;break}g=h+1|0;do{if((j&33554432|0)==0){h=g}else{if(((d[g]|0)-128|0)>>>0>63>>>0){g=20;break a}g=h+2|0;if((j&524288|0)==0){h=g;break}if(((d[g]|0)-128|0)>>>0>63>>>0){g=23;break a}h=h+3|0}}while(0);i=i-1|0;g=7;continue}else if((g|0)==36){k=d[h]|0;g=k>>>3;if((g-16|g+(j>>26))>>>0>7>>>0){g=37;break}g=h+1|0;j=k-128|j<<6;do{if((j|0)<0){k=(d[g]|0)-128|0;if(k>>>0>63>>>0){g=40;break a}g=h+2|0;j=k|j<<6;if((j|0)>=0){h=g;break}g=(d[g]|0)-128|0;if(g>>>0>63>>>0){g=43;break a}j=g|j<<6;h=h+3|0}else{h=g}}while(0);c[b>>2]=j;b=b+4|0;i=i-1|0;g=6;continue}}if((g|0)==17){h=h-1|0;g=46}else if((g|0)==20){h=h-1|0;g=46}else if((g|0)==23){h=h-1|0;g=46}else if((g|0)==37){h=h-1|0;g=46}else if((g|0)==40){h=h-1|0;g=46}else if((g|0)==43){h=h-1|0;g=46}else if((g|0)==53){return f|0}if((g|0)==46){if((j|0)==0){g=47}}do{if((g|0)==47){if((a[h]|0)!=0){break}if((b|0)!=0){c[b>>2]=0;c[e>>2]=0}k=f-i|0;return k|0}}while(0);c[(Ub()|0)>>2]=84;if((b|0)==0){k=-1;return k|0}c[e>>2]=h;k=-1;return k|0}function Oo(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+8|0;h=g|0;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){j=h;c[h>>2]=j;h=j}else{h=b}b=a[e]|0;j=b&255;if(b<<24>>24>-1){c[h>>2]=j;j=b<<24>>24!=0|0;i=g;return j|0}j=j-194|0;if(j>>>0>50>>>0){break}b=e+1|0;j=c[u+(j<<2)>>2]|0;if(f>>>0<4>>>0){if((j&-2147483648>>>(((f*6|0)-6|0)>>>0)|0)!=0){break}}f=d[b]|0;b=f>>>3;if((b-16|b+(j>>26))>>>0>7>>>0){break}f=f-128|j<<6;if((f|0)>=0){c[h>>2]=f;j=2;i=g;return j|0}b=(d[e+2|0]|0)-128|0;if(b>>>0>63>>>0){break}f=b|f<<6;if((f|0)>=0){c[h>>2]=f;j=3;i=g;return j|0}e=(d[e+3|0]|0)-128|0;if(e>>>0>63>>>0){break}c[h>>2]=e|f<<6;j=4;i=g;return j|0}}while(0);c[(Ub()|0)>>2]=84;j=-1;i=g;return j|0}function Po(b,d,e){b=b|0;d=d|0;e=e|0;if((b|0)==0){e=1;return e|0}if(d>>>0<128>>>0){a[b]=d;e=1;return e|0}if(d>>>0<2048>>>0){a[b]=d>>>6|192;a[b+1|0]=d&63|128;e=2;return e|0}if(d>>>0<55296>>>0|(d-57344|0)>>>0<8192>>>0){a[b]=d>>>12|224;a[b+1|0]=d>>>6&63|128;a[b+2|0]=d&63|128;e=3;return e|0}if((d-65536|0)>>>0<1048576>>>0){a[b]=d>>>18|240;a[b+1|0]=d>>>12&63|128;a[b+2|0]=d>>>6&63|128;a[b+3|0]=d&63|128;e=4;return e|0}else{c[(Ub()|0)>>2]=84;e=-1;return e|0}return 0}function Qo(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;h=i;i=i+264|0;f=h+256|0;k=c[b>>2]|0;c[f>>2]=k;g=(a|0)!=0;j=h|0;e=g?e:256;a=g?a:j;a:do{if((k|0)==0|(e|0)==0){j=0}else{l=0;while(1){m=d>>>0>=e>>>0;if(!(m|d>>>0>32>>>0)){j=l;break a}k=m?e:d;d=d-k|0;k=Ro(a,f,k,0)|0;if((k|0)==-1){break}if((a|0)==(j|0)){a=j}else{a=a+k|0;e=e-k|0}l=k+l|0;k=c[f>>2]|0;if((k|0)==0|(e|0)==0){j=l;break a}}j=-1;e=0;k=c[f>>2]|0}}while(0);b:do{if((k|0)!=0){if((e|0)==0|(d|0)==0){break}while(1){l=Po(a,c[k>>2]|0,0)|0;if((l+1|0)>>>0<2>>>0){break}k=(c[f>>2]|0)+4|0;c[f>>2]=k;d=d-1|0;j=j+1|0;if((e|0)==(l|0)|(d|0)==0){break b}else{e=e-l|0;a=a+l|0}}if((l|0)!=0){j=-1;break}c[f>>2]=0}}while(0);if(!g){i=h;return j|0}c[b>>2]=c[f>>2];i=h;return j|0}function Ro(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;j=f|0;if((b|0)==0){l=c[d>>2]|0;k=j|0;m=c[l>>2]|0;if((m|0)==0){m=0;i=f;return m|0}else{h=0}while(1){if(m>>>0>127>>>0){m=Po(k,m,0)|0;if((m|0)==-1){h=-1;l=26;break}}else{m=1}h=m+h|0;l=l+4|0;m=c[l>>2]|0;if((m|0)==0){l=26;break}}if((l|0)==26){i=f;return h|0}}a:do{if(e>>>0>3>>>0){k=e;l=c[d>>2]|0;while(1){m=c[l>>2]|0;if((m|0)==0){break a}if(m>>>0>127>>>0){m=Po(b,m,0)|0;if((m|0)==-1){h=-1;break}b=b+m|0;k=k-m|0}else{a[b]=m;b=b+1|0;k=k-1|0;l=c[d>>2]|0}l=l+4|0;c[d>>2]=l;if(k>>>0<=3>>>0){break a}}i=f;return h|0}else{k=e}}while(0);b:do{if((k|0)==0){g=0}else{j=j|0;l=c[d>>2]|0;while(1){m=c[l>>2]|0;if((m|0)==0){l=24;break}if(m>>>0>127>>>0){m=Po(j,m,0)|0;if((m|0)==-1){h=-1;l=26;break}if(m>>>0>k>>>0){l=20;break}Po(b,c[l>>2]|0,0)|0;b=b+m|0;k=k-m|0}else{a[b]=m;b=b+1|0;k=k-1|0;l=c[d>>2]|0}l=l+4|0;c[d>>2]=l;if((k|0)==0){g=0;break b}}if((l|0)==20){m=e-k|0;i=f;return m|0}else if((l|0)==24){a[b]=0;g=k;break}else if((l|0)==26){i=f;return h|0}}}while(0);c[d>>2]=0;m=e-g|0;i=f;return m|0}function So(a){a=a|0;var b=0;b=a;while(1){if((c[b>>2]|0)==0){break}else{b=b+4|0}}return b-a>>2|0}function To(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((d|0)==0){return a|0}else{e=d;d=a}while(1){e=e-1|0;c[d>>2]=c[b>>2];if((e|0)==0){break}else{b=b+4|0;d=d+4|0}}return a|0}function Uo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=(d|0)==0;if(a-b>>2>>>0<d>>>0){if(e){return a|0}do{d=d-1|0;c[a+(d<<2)>>2]=c[b+(d<<2)>>2];}while((d|0)!=0);return a|0}else{if(e){return a|0}else{e=a}while(1){d=d-1|0;c[e>>2]=c[b>>2];if((d|0)==0){break}else{b=b+4|0;e=e+4|0}}return a|0}return 0}function Vo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((d|0)==0){return a|0}else{e=a}while(1){d=d-1|0;c[e>>2]=b;if((d|0)==0){break}else{e=e+4|0}}return a|0}function Wo(a){a=a|0;return}function Xo(a){a=a|0;c[a>>2]=19568;return}function Yo(a){a=a|0;xp(a);return}function Zo(a){a=a|0;return}function _o(a){a=a|0;return 11600}function $o(a){a=a|0;Wo(a|0);return}function ap(a){a=a|0;return}function bp(a){a=a|0;return}function cp(a){a=a|0;Wo(a|0);xp(a);return}function dp(a){a=a|0;Wo(a|0);xp(a);return}function ep(a){a=a|0;Wo(a|0);xp(a);return}function fp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+56|0;f=e|0;if((a|0)==(b|0)){g=1;i=e;return g|0}if((b|0)==0){g=0;i=e;return g|0}g=jp(b,27168,27152,0)|0;b=g;if((g|0)==0){g=0;i=e;return g|0}Pp(f|0,0,56)|0;c[f>>2]=b;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;Uc[c[(c[g>>2]|0)+28>>2]&31](b,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;i=e;return g|0}c[d>>2]=c[f+16>>2];g=1;i=e;return g|0}function gp(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){g=d+36|0;c[g>>2]=(c[g>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function hp(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;Uc[c[(c[g>>2]|0)+28>>2]&31](g,d,e,f);return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){g=d+36|0;c[g>>2]=(c[g>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function ip(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==(c[d+8>>2]|0)){h=d+16|0;g=c[h>>2]|0;if((g|0)==0){c[h>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){k=d+36|0;c[k>>2]=(c[k>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}h=c[b+12>>2]|0;g=b+16+(h<<3)|0;i=c[b+20>>2]|0;j=i>>8;if((i&1|0)!=0){j=c[(c[e>>2]|0)+j>>2]|0}k=c[b+16>>2]|0;Uc[c[(c[k>>2]|0)+28>>2]&31](k,d,e+j|0,(i&2|0)!=0?f:2);if((h|0)<=1){return}h=d+54|0;i=e;j=b+24|0;while(1){b=c[j+4>>2]|0;k=b>>8;if((b&1|0)!=0){k=c[(c[i>>2]|0)+k>>2]|0}l=c[j>>2]|0;Uc[c[(c[l>>2]|0)+28>>2]&31](l,d,e+k|0,(b&2|0)!=0?f:2);if((a[h]&1)!=0){f=16;break}j=j+8|0;if(j>>>0>=g>>>0){f=16;break}}if((f|0)==16){return}}function jp(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;i=i+56|0;g=f|0;j=c[a>>2]|0;k=a+(c[j-8>>2]|0)|0;j=c[j-4>>2]|0;h=j;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;n=g+16|0;b=g+20|0;e=g+24|0;l=g+28|0;a=g+32|0;m=g+40|0;Pp(n|0,0,39)|0;if((j|0)==(d|0)){c[g+48>>2]=1;Gc[c[(c[j>>2]|0)+20>>2]&63](h,g,k,k,1,0);i=f;return((c[e>>2]|0)==1?k:0)|0}xc[c[(c[j>>2]|0)+24>>2]&15](h,g,k,1,0);d=c[g+36>>2]|0;if((d|0)==0){if((c[m>>2]|0)!=1){n=0;i=f;return n|0}if((c[l>>2]|0)!=1){n=0;i=f;return n|0}n=(c[a>>2]|0)==1?c[b>>2]|0:0;i=f;return n|0}else if((d|0)==1){do{if((c[e>>2]|0)!=1){if((c[m>>2]|0)!=0){n=0;i=f;return n|0}if((c[l>>2]|0)!=1){n=0;i=f;return n|0}if((c[a>>2]|0)==1){break}else{d=0}i=f;return d|0}}while(0);n=c[n>>2]|0;i=f;return n|0}else{n=0;i=f;return n|0}return 0}function kp(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;j=b|0;if((j|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}d=d+28|0;if((c[d>>2]|0)==1){return}c[d>>2]=f;return}if((j|0)==(c[d>>2]|0)){do{if((c[d+16>>2]|0)!=(e|0)){k=d+20|0;if((c[k>>2]|0)==(e|0)){break}c[d+32>>2]=f;j=d+44|0;if((c[j>>2]|0)==4){return}v=c[b+12>>2]|0;m=b+16+(v<<3)|0;a:do{if((v|0)>0){l=d+52|0;o=d+53|0;p=d+54|0;r=b+8|0;s=d+24|0;q=e;n=0;b=b+16|0;u=0;b:do{a[l]=0;a[o]=0;t=c[b+4>>2]|0;v=t>>8;if((t&1|0)!=0){v=c[(c[q>>2]|0)+v>>2]|0}w=c[b>>2]|0;Gc[c[(c[w>>2]|0)+20>>2]&63](w,d,e,e+v|0,2-(t>>>1&1)|0,g);if((a[p]&1)!=0){break}do{if((a[o]&1)!=0){if((a[l]&1)==0){if((c[r>>2]&1|0)==0){u=1;break b}else{u=1;break}}if((c[s>>2]|0)==1){l=27;break a}if((c[r>>2]&2|0)==0){l=27;break a}else{u=1;n=1}}}while(0);b=b+8|0;}while(b>>>0<m>>>0);if(n){i=u;l=26}else{h=u;l=23}}else{h=0;l=23}}while(0);do{if((l|0)==23){c[k>>2]=e;w=d+40|0;c[w>>2]=(c[w>>2]|0)+1;if((c[d+36>>2]|0)!=1){i=h;l=26;break}if((c[d+24>>2]|0)!=2){i=h;l=26;break}a[d+54|0]=1;if(h){l=27}else{l=28}}}while(0);if((l|0)==26){if(i){l=27}else{l=28}}if((l|0)==27){c[j>>2]=3;return}else if((l|0)==28){c[j>>2]=4;return}}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}j=c[b+12>>2]|0;h=b+16+(j<<3)|0;i=c[b+20>>2]|0;k=i>>8;if((i&1|0)!=0){k=c[(c[e>>2]|0)+k>>2]|0}w=c[b+16>>2]|0;xc[c[(c[w>>2]|0)+24>>2]&15](w,d,e+k|0,(i&2|0)!=0?f:2,g);i=b+24|0;if((j|0)<=1){return}k=c[b+8>>2]|0;do{if((k&2|0)==0){j=d+36|0;if((c[j>>2]|0)==1){break}if((k&1|0)==0){k=d+54|0;l=e;m=i;while(1){if((a[k]&1)!=0){l=53;break}if((c[j>>2]|0)==1){l=53;break}n=c[m+4>>2]|0;o=n>>8;if((n&1|0)!=0){o=c[(c[l>>2]|0)+o>>2]|0}w=c[m>>2]|0;xc[c[(c[w>>2]|0)+24>>2]&15](w,d,e+o|0,(n&2|0)!=0?f:2,g);m=m+8|0;if(m>>>0>=h>>>0){l=53;break}}if((l|0)==53){return}}k=d+24|0;m=d+54|0;l=e;o=i;while(1){if((a[m]&1)!=0){l=53;break}if((c[j>>2]|0)==1){if((c[k>>2]|0)==1){l=53;break}}n=c[o+4>>2]|0;p=n>>8;if((n&1|0)!=0){p=c[(c[l>>2]|0)+p>>2]|0}w=c[o>>2]|0;xc[c[(c[w>>2]|0)+24>>2]&15](w,d,e+p|0,(n&2|0)!=0?f:2,g);o=o+8|0;if(o>>>0>=h>>>0){l=53;break}}if((l|0)==53){return}}}while(0);j=d+54|0;k=e;while(1){if((a[j]&1)!=0){l=53;break}l=c[i+4>>2]|0;m=l>>8;if((l&1|0)!=0){m=c[(c[k>>2]|0)+m>>2]|0}w=c[i>>2]|0;xc[c[(c[w>>2]|0)+24>>2]&15](w,d,e+m|0,(l&2|0)!=0?f:2,g);i=i+8|0;if(i>>>0>=h>>>0){l=53;break}}if((l|0)==53){return}}function lp(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;i=b|0;if((i|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}h=d+28|0;if((c[h>>2]|0)==1){return}c[h>>2]=f;return}if((i|0)!=(c[d>>2]|0)){j=c[b+8>>2]|0;xc[c[(c[j>>2]|0)+24>>2]&15](j,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){i=d+20|0;if((c[i>>2]|0)==(e|0)){break}c[d+32>>2]=f;f=d+44|0;if((c[f>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;b=c[b+8>>2]|0;Gc[c[(c[b>>2]|0)+20>>2]&63](b,d,e,e,1,g);if((a[k]&1)==0){b=0;h=13}else{if((a[j]&1)==0){b=1;h=13}}a:do{if((h|0)==13){c[i>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){h=16;break}a[d+54|0]=1;if(b){break a}}else{h=16}}while(0);if((h|0)==16){if(b){break}}c[f>>2]=4;return}}while(0);c[f>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function mp(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}d=d+28|0;if((c[d>>2]|0)==1){return}c[d>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;g=d+40|0;c[g>>2]=(c[g>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function np(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;if((b|0)!=(c[d+8>>2]|0)){k=d+52|0;j=a[k]&1;m=d+53|0;l=a[m]&1;o=c[b+12>>2]|0;i=b+16+(o<<3)|0;a[k]=0;a[m]=0;n=c[b+20>>2]|0;p=n>>8;if((n&1|0)!=0){p=c[(c[f>>2]|0)+p>>2]|0}s=c[b+16>>2]|0;Gc[c[(c[s>>2]|0)+20>>2]&63](s,d,e,f+p|0,(n&2|0)!=0?g:2,h);a:do{if((o|0)>1){p=d+24|0;o=b+8|0;q=d+54|0;n=f;b=b+24|0;do{if((a[q]&1)!=0){break a}do{if((a[k]&1)==0){if((a[m]&1)==0){break}if((c[o>>2]&1|0)==0){break a}}else{if((c[p>>2]|0)==1){break a}if((c[o>>2]&2|0)==0){break a}}}while(0);a[k]=0;a[m]=0;r=c[b+4>>2]|0;s=r>>8;if((r&1|0)!=0){s=c[(c[n>>2]|0)+s>>2]|0}t=c[b>>2]|0;Gc[c[(c[t>>2]|0)+20>>2]&63](t,d,e,f+s|0,(r&2|0)!=0?g:2,h);b=b+8|0;}while(b>>>0<i>>>0)}}while(0);a[k]=j;a[m]=l;return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;i=d+16|0;j=c[i>>2]|0;if((j|0)==0){c[i>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((j|0)!=(e|0)){t=d+36|0;c[t>>2]=(c[t>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;i=c[e>>2]|0;if((i|0)==2){c[e>>2]=g}else{g=i}if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}function op(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;if((b|0)!=(c[d+8>>2]|0)){b=c[b+8>>2]|0;Gc[c[(c[b>>2]|0)+20>>2]&63](b,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;b=d+16|0;f=c[b>>2]|0;if((f|0)==0){c[b>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((f|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g}else{g=b}if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}function pp(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){h=d+36|0;c[h>>2]=(c[h>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;f=c[e>>2]|0;if((f|0)==2){c[e>>2]=g}else{g=f}if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}function qp(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){a=16}else{a=a+11&-8}f=a>>>3;e=c[6832]|0;b=e>>>(f>>>0);if((b&3|0)!=0){g=(b&1^1)+f|0;h=g<<1;b=27368+(h<<2)|0;h=27368+(h+2<<2)|0;f=c[h>>2]|0;d=f+8|0;a=c[d>>2]|0;do{if((b|0)==(a|0)){c[6832]=e&~(1<<g)}else{if(a>>>0<(c[6836]|0)>>>0){dc();return 0}e=a+12|0;if((c[e>>2]|0)==(f|0)){c[e>>2]=b;c[h>>2]=a;break}else{dc();return 0}}}while(0);q=g<<3;c[f+4>>2]=q|3;q=f+(q|4)|0;c[q>>2]=c[q>>2]|1;q=d;return q|0}if(a>>>0<=(c[6834]|0)>>>0){break}if((b|0)!=0){g=2<<f;g=b<<f&(g|-g);g=(g&-g)-1|0;b=g>>>12&16;g=g>>>(b>>>0);h=g>>>5&8;g=g>>>(h>>>0);f=g>>>2&4;g=g>>>(f>>>0);i=g>>>1&2;g=g>>>(i>>>0);d=g>>>1&1;d=(h|b|f|i|d)+(g>>>(d>>>0))|0;g=d<<1;i=27368+(g<<2)|0;g=27368+(g+2<<2)|0;f=c[g>>2]|0;b=f+8|0;h=c[b>>2]|0;do{if((i|0)==(h|0)){c[6832]=e&~(1<<d)}else{if(h>>>0<(c[6836]|0)>>>0){dc();return 0}e=h+12|0;if((c[e>>2]|0)==(f|0)){c[e>>2]=i;c[g>>2]=h;break}else{dc();return 0}}}while(0);q=d<<3;d=q-a|0;c[f+4>>2]=a|3;e=f+a|0;c[f+(a|4)>>2]=d|1;c[f+q>>2]=d;f=c[6834]|0;if((f|0)!=0){a=c[6837]|0;g=f>>>3;h=g<<1;f=27368+(h<<2)|0;i=c[6832]|0;g=1<<g;do{if((i&g|0)==0){c[6832]=i|g;g=f;h=27368+(h+2<<2)|0}else{h=27368+(h+2<<2)|0;g=c[h>>2]|0;if(g>>>0>=(c[6836]|0)>>>0){break}dc();return 0}}while(0);c[h>>2]=a;c[g+12>>2]=a;c[a+8>>2]=g;c[a+12>>2]=f}c[6834]=d;c[6837]=e;q=b;return q|0}b=c[6833]|0;if((b|0)==0){break}e=(b&-b)-1|0;p=e>>>12&16;e=e>>>(p>>>0);o=e>>>5&8;e=e>>>(o>>>0);q=e>>>2&4;e=e>>>(q>>>0);d=e>>>1&2;e=e>>>(d>>>0);b=e>>>1&1;b=c[27632+((o|p|q|d|b)+(e>>>(b>>>0))<<2)>>2]|0;e=b;d=b;b=(c[b+4>>2]&-8)-a|0;while(1){f=c[e+16>>2]|0;if((f|0)==0){f=c[e+20>>2]|0;if((f|0)==0){break}}g=(c[f+4>>2]&-8)-a|0;h=g>>>0<b>>>0;e=f;d=h?f:d;b=h?g:b}f=d;h=c[6836]|0;if(f>>>0<h>>>0){dc();return 0}q=f+a|0;e=q;if(f>>>0>=q>>>0){dc();return 0}g=c[d+24>>2]|0;i=c[d+12>>2]|0;do{if((i|0)==(d|0)){j=d+20|0;i=c[j>>2]|0;if((i|0)==0){j=d+16|0;i=c[j>>2]|0;if((i|0)==0){i=0;break}}while(1){l=i+20|0;k=c[l>>2]|0;if((k|0)!=0){i=k;j=l;continue}l=i+16|0;k=c[l>>2]|0;if((k|0)==0){break}else{i=k;j=l}}if(j>>>0<h>>>0){dc();return 0}else{c[j>>2]=0;break}}else{j=c[d+8>>2]|0;if(j>>>0<h>>>0){dc();return 0}h=j+12|0;if((c[h>>2]|0)!=(d|0)){dc();return 0}k=i+8|0;if((c[k>>2]|0)==(d|0)){c[h>>2]=i;c[k>>2]=j;break}else{dc();return 0}}}while(0);a:do{if((g|0)!=0){h=d+28|0;j=27632+(c[h>>2]<<2)|0;do{if((d|0)==(c[j>>2]|0)){c[j>>2]=i;if((i|0)!=0){break}c[6833]=c[6833]&~(1<<c[h>>2]);break a}else{if(g>>>0<(c[6836]|0)>>>0){dc();return 0}h=g+16|0;if((c[h>>2]|0)==(d|0)){c[h>>2]=i}else{c[g+20>>2]=i}if((i|0)==0){break a}}}while(0);if(i>>>0<(c[6836]|0)>>>0){dc();return 0}c[i+24>>2]=g;g=c[d+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[i+16>>2]=g;c[g+24>>2]=i;break}}}while(0);g=c[d+20>>2]|0;if((g|0)==0){break}if(g>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[i+20>>2]=g;c[g+24>>2]=i;break}}}while(0);if(b>>>0<16>>>0){q=b+a|0;c[d+4>>2]=q|3;q=f+(q+4)|0;c[q>>2]=c[q>>2]|1}else{c[d+4>>2]=a|3;c[f+(a|4)>>2]=b|1;c[f+(b+a)>>2]=b;f=c[6834]|0;if((f|0)!=0){a=c[6837]|0;i=f>>>3;h=i<<1;f=27368+(h<<2)|0;g=c[6832]|0;i=1<<i;do{if((g&i|0)==0){c[6832]=g|i;g=f;h=27368+(h+2<<2)|0}else{h=27368+(h+2<<2)|0;g=c[h>>2]|0;if(g>>>0>=(c[6836]|0)>>>0){break}dc();return 0}}while(0);c[h>>2]=a;c[g+12>>2]=a;c[a+8>>2]=g;c[a+12>>2]=f}c[6834]=b;c[6837]=e}q=d+8|0;return q|0}else{if(a>>>0>4294967231>>>0){a=-1;break}b=a+11|0;a=b&-8;f=c[6833]|0;if((f|0)==0){break}e=-a|0;b=b>>>8;do{if((b|0)==0){g=0}else{if(a>>>0>16777215>>>0){g=31;break}p=(b+1048320|0)>>>16&8;q=b<<p;o=(q+520192|0)>>>16&4;q=q<<o;g=(q+245760|0)>>>16&2;g=14-(o|p|g)+(q<<g>>>15)|0;g=a>>>((g+7|0)>>>0)&1|g<<1}}while(0);h=c[27632+(g<<2)>>2]|0;b:do{if((h|0)==0){b=0;j=0}else{if((g|0)==31){i=0}else{i=25-(g>>>1)|0}b=0;i=a<<i;j=0;while(1){l=c[h+4>>2]&-8;k=l-a|0;if(k>>>0<e>>>0){if((l|0)==(a|0)){b=h;e=k;j=h;break b}else{b=h;e=k}}k=c[h+20>>2]|0;h=c[h+16+(i>>>31<<2)>>2]|0;j=(k|0)==0|(k|0)==(h|0)?j:k;if((h|0)==0){break}else{i=i<<1}}}}while(0);if((j|0)==0&(b|0)==0){q=2<<g;f=f&(q|-q);if((f|0)==0){break}q=(f&-f)-1|0;n=q>>>12&16;q=q>>>(n>>>0);m=q>>>5&8;q=q>>>(m>>>0);o=q>>>2&4;q=q>>>(o>>>0);p=q>>>1&2;q=q>>>(p>>>0);j=q>>>1&1;j=c[27632+((m|n|o|p|j)+(q>>>(j>>>0))<<2)>>2]|0}if((j|0)!=0){while(1){g=(c[j+4>>2]&-8)-a|0;f=g>>>0<e>>>0;e=f?g:e;b=f?j:b;f=c[j+16>>2]|0;if((f|0)!=0){j=f;continue}j=c[j+20>>2]|0;if((j|0)==0){break}}}if((b|0)==0){break}if(e>>>0>=((c[6834]|0)-a|0)>>>0){break}d=b;i=c[6836]|0;if(d>>>0<i>>>0){dc();return 0}g=d+a|0;f=g;if(d>>>0>=g>>>0){dc();return 0}h=c[b+24>>2]|0;j=c[b+12>>2]|0;do{if((j|0)==(b|0)){k=b+20|0;j=c[k>>2]|0;if((j|0)==0){k=b+16|0;j=c[k>>2]|0;if((j|0)==0){j=0;break}}while(1){m=j+20|0;l=c[m>>2]|0;if((l|0)!=0){j=l;k=m;continue}l=j+16|0;m=c[l>>2]|0;if((m|0)==0){break}else{j=m;k=l}}if(k>>>0<i>>>0){dc();return 0}else{c[k>>2]=0;break}}else{k=c[b+8>>2]|0;if(k>>>0<i>>>0){dc();return 0}l=k+12|0;if((c[l>>2]|0)!=(b|0)){dc();return 0}i=j+8|0;if((c[i>>2]|0)==(b|0)){c[l>>2]=j;c[i>>2]=k;break}else{dc();return 0}}}while(0);c:do{if((h|0)!=0){i=b+28|0;k=27632+(c[i>>2]<<2)|0;do{if((b|0)==(c[k>>2]|0)){c[k>>2]=j;if((j|0)!=0){break}c[6833]=c[6833]&~(1<<c[i>>2]);break c}else{if(h>>>0<(c[6836]|0)>>>0){dc();return 0}i=h+16|0;if((c[i>>2]|0)==(b|0)){c[i>>2]=j}else{c[h+20>>2]=j}if((j|0)==0){break c}}}while(0);if(j>>>0<(c[6836]|0)>>>0){dc();return 0}c[j+24>>2]=h;h=c[b+16>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[j+16>>2]=h;c[h+24>>2]=j;break}}}while(0);h=c[b+20>>2]|0;if((h|0)==0){break}if(h>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[j+20>>2]=h;c[h+24>>2]=j;break}}}while(0);d:do{if(e>>>0<16>>>0){q=e+a|0;c[b+4>>2]=q|3;q=d+(q+4)|0;c[q>>2]=c[q>>2]|1}else{c[b+4>>2]=a|3;c[d+(a|4)>>2]=e|1;c[d+(e+a)>>2]=e;h=e>>>3;if(e>>>0<256>>>0){g=h<<1;e=27368+(g<<2)|0;i=c[6832]|0;h=1<<h;do{if((i&h|0)==0){c[6832]=i|h;h=e;g=27368+(g+2<<2)|0}else{g=27368+(g+2<<2)|0;h=c[g>>2]|0;if(h>>>0>=(c[6836]|0)>>>0){break}dc();return 0}}while(0);c[g>>2]=f;c[h+12>>2]=f;c[d+(a+8)>>2]=h;c[d+(a+12)>>2]=e;break}f=e>>>8;do{if((f|0)==0){f=0}else{if(e>>>0>16777215>>>0){f=31;break}p=(f+1048320|0)>>>16&8;q=f<<p;o=(q+520192|0)>>>16&4;q=q<<o;f=(q+245760|0)>>>16&2;f=14-(o|p|f)+(q<<f>>>15)|0;f=e>>>((f+7|0)>>>0)&1|f<<1}}while(0);h=27632+(f<<2)|0;c[d+(a+28)>>2]=f;c[d+(a+20)>>2]=0;c[d+(a+16)>>2]=0;j=c[6833]|0;i=1<<f;if((j&i|0)==0){c[6833]=j|i;c[h>>2]=g;c[d+(a+24)>>2]=h;c[d+(a+12)>>2]=g;c[d+(a+8)>>2]=g;break}j=c[h>>2]|0;if((f|0)==31){h=0}else{h=25-(f>>>1)|0}e:do{if((c[j+4>>2]&-8|0)!=(e|0)){f=j;h=e<<h;while(1){i=f+16+(h>>>31<<2)|0;j=c[i>>2]|0;if((j|0)==0){break}if((c[j+4>>2]&-8|0)==(e|0)){break e}else{f=j;h=h<<1}}if(i>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[i>>2]=g;c[d+(a+24)>>2]=f;c[d+(a+12)>>2]=g;c[d+(a+8)>>2]=g;break d}}}while(0);f=j+8|0;h=c[f>>2]|0;e=c[6836]|0;if(j>>>0<e>>>0){dc();return 0}if(h>>>0<e>>>0){dc();return 0}else{c[h+12>>2]=g;c[f>>2]=g;c[d+(a+8)>>2]=h;c[d+(a+12)>>2]=j;c[d+(a+24)>>2]=0;break}}}while(0);q=b+8|0;return q|0}}while(0);b=c[6834]|0;if(a>>>0<=b>>>0){e=b-a|0;d=c[6837]|0;if(e>>>0>15>>>0){q=d;c[6837]=q+a;c[6834]=e;c[q+(a+4)>>2]=e|1;c[q+b>>2]=e;c[d+4>>2]=a|3}else{c[6834]=0;c[6837]=0;c[d+4>>2]=b|3;q=d+(b+4)|0;c[q>>2]=c[q>>2]|1}q=d+8|0;return q|0}b=c[6835]|0;if(a>>>0<b>>>0){o=b-a|0;c[6835]=o;q=c[6838]|0;p=q;c[6838]=p+a;c[p+(a+4)>>2]=o|1;c[q+4>>2]=a|3;q=q+8|0;return q|0}do{if((c[6820]|0)==0){b=bc(30)|0;if((b-1&b|0)==0){c[6822]=b;c[6821]=b;c[6823]=-1;c[6824]=-1;c[6825]=0;c[6943]=0;c[6820]=(uc(0)|0)&-16^1431655768;break}else{dc();return 0}}}while(0);g=a+48|0;e=c[6822]|0;h=a+47|0;b=e+h|0;e=-e|0;f=b&e;if(f>>>0<=a>>>0){q=0;return q|0}i=c[6942]|0;do{if((i|0)!=0){p=c[6940]|0;q=p+f|0;if(q>>>0<=p>>>0|q>>>0>i>>>0){a=0}else{break}return a|0}}while(0);f:do{if((c[6943]&4|0)==0){i=c[6838]|0;g:do{if((i|0)==0){d=182}else{j=27776;while(1){k=j|0;m=c[k>>2]|0;if(m>>>0<=i>>>0){l=j+4|0;if((m+(c[l>>2]|0)|0)>>>0>i>>>0){break}}j=c[j+8>>2]|0;if((j|0)==0){d=182;break g}}if((j|0)==0){d=182;break}i=b-(c[6835]|0)&e;if(i>>>0>=2147483647>>>0){e=0;break}j=Tb(i|0)|0;d=(j|0)==((c[k>>2]|0)+(c[l>>2]|0)|0);b=d?j:-1;e=d?i:0;d=191}}while(0);do{if((d|0)==182){b=Tb(0)|0;if((b|0)==-1){e=0;break}i=b;e=c[6821]|0;j=e-1|0;if((j&i|0)==0){i=f}else{i=f-i+(j+i&-e)|0}j=c[6940]|0;e=j+i|0;if(!(i>>>0>a>>>0&i>>>0<2147483647>>>0)){e=0;break}k=c[6942]|0;if((k|0)!=0){if(e>>>0<=j>>>0|e>>>0>k>>>0){e=0;break}}j=Tb(i|0)|0;d=(j|0)==(b|0);b=d?b:-1;e=d?i:0;d=191}}while(0);h:do{if((d|0)==191){d=-i|0;if((b|0)!=-1){d=202;break f}do{if((j|0)!=-1&i>>>0<2147483647>>>0&i>>>0<g>>>0){b=c[6822]|0;b=h-i+b&-b;if(b>>>0>=2147483647>>>0){break}if((Tb(b|0)|0)==-1){Tb(d|0)|0;break h}else{i=b+i|0;break}}}while(0);if((j|0)!=-1){e=i;b=j;d=202;break f}}}while(0);c[6943]=c[6943]|4;d=199}else{e=0;d=199}}while(0);do{if((d|0)==199){if(f>>>0>=2147483647>>>0){break}b=Tb(f|0)|0;f=Tb(0)|0;if(!((f|0)!=-1&(b|0)!=-1&b>>>0<f>>>0)){break}g=f-b|0;f=g>>>0>(a+40|0)>>>0;if(f){e=f?g:e;d=202}}}while(0);do{if((d|0)==202){f=(c[6940]|0)+e|0;c[6940]=f;if(f>>>0>(c[6941]|0)>>>0){c[6941]=f}f=c[6838]|0;i:do{if((f|0)==0){q=c[6836]|0;if((q|0)==0|b>>>0<q>>>0){c[6836]=b}c[6944]=b;c[6945]=e;c[6947]=0;c[6841]=c[6820];c[6840]=-1;d=0;do{q=d<<1;p=27368+(q<<2)|0;c[27368+(q+3<<2)>>2]=p;c[27368+(q+2<<2)>>2]=p;d=d+1|0;}while(d>>>0<32>>>0);d=b+8|0;if((d&7|0)==0){d=0}else{d=-d&7}q=e-40-d|0;c[6838]=b+d;c[6835]=q;c[b+(d+4)>>2]=q|1;c[b+(e-36)>>2]=40;c[6839]=c[6824]}else{h=27776;do{g=c[h>>2]|0;i=h+4|0;j=c[i>>2]|0;if((b|0)==(g+j|0)){d=214;break}h=c[h+8>>2]|0;}while((h|0)!=0);do{if((d|0)==214){if((c[h+12>>2]&8|0)!=0){break}q=f;if(!(q>>>0>=g>>>0&q>>>0<b>>>0)){break}c[i>>2]=j+e;q=c[6838]|0;b=(c[6835]|0)+e|0;d=q;e=q+8|0;if((e&7|0)==0){e=0}else{e=-e&7}q=b-e|0;c[6838]=d+e;c[6835]=q;c[d+(e+4)>>2]=q|1;c[d+(b+4)>>2]=40;c[6839]=c[6824];break i}}while(0);if(b>>>0<(c[6836]|0)>>>0){c[6836]=b}g=b+e|0;h=27776;do{i=h|0;if((c[i>>2]|0)==(g|0)){d=224;break}h=c[h+8>>2]|0;}while((h|0)!=0);do{if((d|0)==224){if((c[h+12>>2]&8|0)!=0){break}c[i>>2]=b;d=h+4|0;c[d>>2]=(c[d>>2]|0)+e;d=b+8|0;if((d&7|0)==0){d=0}else{d=-d&7}f=b+(e+8)|0;if((f&7|0)==0){j=0}else{j=-f&7}l=b+(j+e)|0;m=l;f=d+a|0;h=b+f|0;g=h;i=l-(b+d)-a|0;c[b+(d+4)>>2]=a|3;j:do{if((m|0)==(c[6838]|0)){q=(c[6835]|0)+i|0;c[6835]=q;c[6838]=g;c[b+(f+4)>>2]=q|1}else{if((m|0)==(c[6837]|0)){q=(c[6834]|0)+i|0;c[6834]=q;c[6837]=g;c[b+(f+4)>>2]=q|1;c[b+(q+f)>>2]=q;break}k=e+4|0;o=c[b+(k+j)>>2]|0;if((o&3|0)==1){a=o&-8;n=o>>>3;k:do{if(o>>>0<256>>>0){l=c[b+((j|8)+e)>>2]|0;k=c[b+(e+12+j)>>2]|0;o=27368+(n<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<(c[6836]|0)>>>0){dc();return 0}if((c[l+12>>2]|0)==(m|0)){break}dc();return 0}}while(0);if((k|0)==(l|0)){c[6832]=c[6832]&~(1<<n);break}do{if((k|0)==(o|0)){n=k+8|0}else{if(k>>>0<(c[6836]|0)>>>0){dc();return 0}n=k+8|0;if((c[n>>2]|0)==(m|0)){break}dc();return 0}}while(0);c[l+12>>2]=k;c[n>>2]=l}else{m=c[b+((j|24)+e)>>2]|0;n=c[b+(e+12+j)>>2]|0;do{if((n|0)==(l|0)){p=j|16;o=b+(k+p)|0;n=c[o>>2]|0;if((n|0)==0){o=b+(p+e)|0;n=c[o>>2]|0;if((n|0)==0){n=0;break}}while(1){q=n+20|0;p=c[q>>2]|0;if((p|0)!=0){n=p;o=q;continue}q=n+16|0;p=c[q>>2]|0;if((p|0)==0){break}else{n=p;o=q}}if(o>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[o>>2]=0;break}}else{p=c[b+((j|8)+e)>>2]|0;if(p>>>0<(c[6836]|0)>>>0){dc();return 0}o=p+12|0;if((c[o>>2]|0)!=(l|0)){dc();return 0}q=n+8|0;if((c[q>>2]|0)==(l|0)){c[o>>2]=n;c[q>>2]=p;break}else{dc();return 0}}}while(0);if((m|0)==0){break}o=b+(e+28+j)|0;p=27632+(c[o>>2]<<2)|0;do{if((l|0)==(c[p>>2]|0)){c[p>>2]=n;if((n|0)!=0){break}c[6833]=c[6833]&~(1<<c[o>>2]);break k}else{if(m>>>0<(c[6836]|0)>>>0){dc();return 0}o=m+16|0;if((c[o>>2]|0)==(l|0)){c[o>>2]=n}else{c[m+20>>2]=n}if((n|0)==0){break k}}}while(0);if(n>>>0<(c[6836]|0)>>>0){dc();return 0}c[n+24>>2]=m;m=j|16;l=c[b+(m+e)>>2]|0;do{if((l|0)!=0){if(l>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[n+16>>2]=l;c[l+24>>2]=n;break}}}while(0);k=c[b+(k+m)>>2]|0;if((k|0)==0){break}if(k>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[n+20>>2]=k;c[k+24>>2]=n;break}}}while(0);m=b+((a|j)+e)|0;i=a+i|0}j=m+4|0;c[j>>2]=c[j>>2]&-2;c[b+(f+4)>>2]=i|1;c[b+(i+f)>>2]=i;j=i>>>3;if(i>>>0<256>>>0){e=j<<1;a=27368+(e<<2)|0;h=c[6832]|0;i=1<<j;do{if((h&i|0)==0){c[6832]=h|i;h=a;e=27368+(e+2<<2)|0}else{e=27368+(e+2<<2)|0;h=c[e>>2]|0;if(h>>>0>=(c[6836]|0)>>>0){break}dc();return 0}}while(0);c[e>>2]=g;c[h+12>>2]=g;c[b+(f+8)>>2]=h;c[b+(f+12)>>2]=a;break}a=i>>>8;do{if((a|0)==0){a=0}else{if(i>>>0>16777215>>>0){a=31;break}p=(a+1048320|0)>>>16&8;q=a<<p;o=(q+520192|0)>>>16&4;q=q<<o;a=(q+245760|0)>>>16&2;a=14-(o|p|a)+(q<<a>>>15)|0;a=i>>>((a+7|0)>>>0)&1|a<<1}}while(0);j=27632+(a<<2)|0;c[b+(f+28)>>2]=a;c[b+(f+20)>>2]=0;c[b+(f+16)>>2]=0;e=c[6833]|0;g=1<<a;if((e&g|0)==0){c[6833]=e|g;c[j>>2]=h;c[b+(f+24)>>2]=j;c[b+(f+12)>>2]=h;c[b+(f+8)>>2]=h;break}e=c[j>>2]|0;if((a|0)==31){g=0}else{g=25-(a>>>1)|0}l:do{if((c[e+4>>2]&-8|0)!=(i|0)){a=e;j=i<<g;while(1){g=a+16+(j>>>31<<2)|0;e=c[g>>2]|0;if((e|0)==0){break}if((c[e+4>>2]&-8|0)==(i|0)){break l}else{a=e;j=j<<1}}if(g>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[g>>2]=h;c[b+(f+24)>>2]=a;c[b+(f+12)>>2]=h;c[b+(f+8)>>2]=h;break j}}}while(0);i=e+8|0;g=c[i>>2]|0;a=c[6836]|0;if(e>>>0<a>>>0){dc();return 0}if(g>>>0<a>>>0){dc();return 0}else{c[g+12>>2]=h;c[i>>2]=h;c[b+(f+8)>>2]=g;c[b+(f+12)>>2]=e;c[b+(f+24)>>2]=0;break}}}while(0);q=b+(d|8)|0;return q|0}}while(0);d=f;j=27776;while(1){h=c[j>>2]|0;if(h>>>0<=d>>>0){i=c[j+4>>2]|0;g=h+i|0;if(g>>>0>d>>>0){break}}j=c[j+8>>2]|0}j=h+(i-39)|0;if((j&7|0)==0){j=0}else{j=-j&7}h=h+(i-47+j)|0;h=h>>>0<(f+16|0)>>>0?d:h;i=h+8|0;j=b+8|0;if((j&7|0)==0){j=0}else{j=-j&7}q=e-40-j|0;c[6838]=b+j;c[6835]=q;c[b+(j+4)>>2]=q|1;c[b+(e-36)>>2]=40;c[6839]=c[6824];c[h+4>>2]=27;c[i>>2]=c[6944];c[i+4>>2]=c[6945];c[i+8>>2]=c[6946];c[i+12>>2]=c[6947];c[6944]=b;c[6945]=e;c[6947]=0;c[6946]=i;e=h+28|0;c[e>>2]=7;if((h+32|0)>>>0<g>>>0){while(1){b=e+4|0;c[b>>2]=7;if((e+8|0)>>>0<g>>>0){e=b}else{break}}}if((h|0)==(d|0)){break}e=h-f|0;g=d+(e+4)|0;c[g>>2]=c[g>>2]&-2;c[f+4>>2]=e|1;c[d+e>>2]=e;g=e>>>3;if(e>>>0<256>>>0){d=g<<1;b=27368+(d<<2)|0;e=c[6832]|0;g=1<<g;do{if((e&g|0)==0){c[6832]=e|g;e=b;d=27368+(d+2<<2)|0}else{d=27368+(d+2<<2)|0;e=c[d>>2]|0;if(e>>>0>=(c[6836]|0)>>>0){break}dc();return 0}}while(0);c[d>>2]=f;c[e+12>>2]=f;c[f+8>>2]=e;c[f+12>>2]=b;break}b=f;d=e>>>8;do{if((d|0)==0){d=0}else{if(e>>>0>16777215>>>0){d=31;break}p=(d+1048320|0)>>>16&8;q=d<<p;o=(q+520192|0)>>>16&4;q=q<<o;d=(q+245760|0)>>>16&2;d=14-(o|p|d)+(q<<d>>>15)|0;d=e>>>((d+7|0)>>>0)&1|d<<1}}while(0);i=27632+(d<<2)|0;c[f+28>>2]=d;c[f+20>>2]=0;c[f+16>>2]=0;g=c[6833]|0;h=1<<d;if((g&h|0)==0){c[6833]=g|h;c[i>>2]=b;c[f+24>>2]=i;c[f+12>>2]=f;c[f+8>>2]=f;break}g=c[i>>2]|0;if((d|0)==31){h=0}else{h=25-(d>>>1)|0}m:do{if((c[g+4>>2]&-8|0)!=(e|0)){d=g;h=e<<h;while(1){i=d+16+(h>>>31<<2)|0;g=c[i>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(e|0)){break m}else{d=g;h=h<<1}}if(i>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[i>>2]=b;c[f+24>>2]=d;c[f+12>>2]=f;c[f+8>>2]=f;break i}}}while(0);e=g+8|0;h=c[e>>2]|0;d=c[6836]|0;if(g>>>0<d>>>0){dc();return 0}if(h>>>0<d>>>0){dc();return 0}else{c[h+12>>2]=b;c[e>>2]=b;c[f+8>>2]=h;c[f+12>>2]=g;c[f+24>>2]=0;break}}}while(0);b=c[6835]|0;if(b>>>0<=a>>>0){break}o=b-a|0;c[6835]=o;q=c[6838]|0;p=q;c[6838]=p+a;c[p+(a+4)>>2]=o|1;c[q+4>>2]=a|3;q=q+8|0;return q|0}}while(0);c[(Ub()|0)>>2]=12;q=0;return q|0}function rp(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((a|0)==0){return}p=a-8|0;r=p;q=c[6836]|0;if(p>>>0<q>>>0){dc()}n=c[a-4>>2]|0;m=n&3;if((m|0)==1){dc()}h=n&-8;k=a+(h-8)|0;i=k;a:do{if((n&1|0)==0){u=c[p>>2]|0;if((m|0)==0){return}p=-8-u|0;r=a+p|0;m=r;n=u+h|0;if(r>>>0<q>>>0){dc()}if((m|0)==(c[6837]|0)){b=a+(h-4)|0;if((c[b>>2]&3|0)!=3){b=m;l=n;break}c[6834]=n;c[b>>2]=c[b>>2]&-2;c[a+(p+4)>>2]=n|1;c[k>>2]=n;return}t=u>>>3;if(u>>>0<256>>>0){b=c[a+(p+8)>>2]|0;l=c[a+(p+12)>>2]|0;o=27368+(t<<1<<2)|0;do{if((b|0)!=(o|0)){if(b>>>0<q>>>0){dc()}if((c[b+12>>2]|0)==(m|0)){break}dc()}}while(0);if((l|0)==(b|0)){c[6832]=c[6832]&~(1<<t);b=m;l=n;break}do{if((l|0)==(o|0)){s=l+8|0}else{if(l>>>0<q>>>0){dc()}o=l+8|0;if((c[o>>2]|0)==(m|0)){s=o;break}dc()}}while(0);c[b+12>>2]=l;c[s>>2]=b;b=m;l=n;break}s=c[a+(p+24)>>2]|0;u=c[a+(p+12)>>2]|0;do{if((u|0)==(r|0)){u=a+(p+20)|0;t=c[u>>2]|0;if((t|0)==0){u=a+(p+16)|0;t=c[u>>2]|0;if((t|0)==0){o=0;break}}while(1){w=t+20|0;v=c[w>>2]|0;if((v|0)!=0){t=v;u=w;continue}v=t+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{t=w;u=v}}if(u>>>0<q>>>0){dc()}else{c[u>>2]=0;o=t;break}}else{t=c[a+(p+8)>>2]|0;if(t>>>0<q>>>0){dc()}q=t+12|0;if((c[q>>2]|0)!=(r|0)){dc()}v=u+8|0;if((c[v>>2]|0)==(r|0)){c[q>>2]=u;c[v>>2]=t;o=u;break}else{dc()}}}while(0);if((s|0)==0){b=m;l=n;break}q=a+(p+28)|0;t=27632+(c[q>>2]<<2)|0;do{if((r|0)==(c[t>>2]|0)){c[t>>2]=o;if((o|0)!=0){break}c[6833]=c[6833]&~(1<<c[q>>2]);b=m;l=n;break a}else{if(s>>>0<(c[6836]|0)>>>0){dc()}q=s+16|0;if((c[q>>2]|0)==(r|0)){c[q>>2]=o}else{c[s+20>>2]=o}if((o|0)==0){b=m;l=n;break a}}}while(0);if(o>>>0<(c[6836]|0)>>>0){dc()}c[o+24>>2]=s;q=c[a+(p+16)>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[6836]|0)>>>0){dc()}else{c[o+16>>2]=q;c[q+24>>2]=o;break}}}while(0);p=c[a+(p+20)>>2]|0;if((p|0)==0){b=m;l=n;break}if(p>>>0<(c[6836]|0)>>>0){dc()}else{c[o+20>>2]=p;c[p+24>>2]=o;b=m;l=n;break}}else{b=r;l=h}}while(0);m=b;if(m>>>0>=k>>>0){dc()}n=a+(h-4)|0;o=c[n>>2]|0;if((o&1|0)==0){dc()}do{if((o&2|0)==0){if((i|0)==(c[6838]|0)){w=(c[6835]|0)+l|0;c[6835]=w;c[6838]=b;c[b+4>>2]=w|1;if((b|0)!=(c[6837]|0)){return}c[6837]=0;c[6834]=0;return}if((i|0)==(c[6837]|0)){w=(c[6834]|0)+l|0;c[6834]=w;c[6837]=b;c[b+4>>2]=w|1;c[m+w>>2]=w;return}l=(o&-8)+l|0;n=o>>>3;b:do{if(o>>>0<256>>>0){g=c[a+h>>2]|0;h=c[a+(h|4)>>2]|0;a=27368+(n<<1<<2)|0;do{if((g|0)!=(a|0)){if(g>>>0<(c[6836]|0)>>>0){dc()}if((c[g+12>>2]|0)==(i|0)){break}dc()}}while(0);if((h|0)==(g|0)){c[6832]=c[6832]&~(1<<n);break}do{if((h|0)==(a|0)){j=h+8|0}else{if(h>>>0<(c[6836]|0)>>>0){dc()}a=h+8|0;if((c[a>>2]|0)==(i|0)){j=a;break}dc()}}while(0);c[g+12>>2]=h;c[j>>2]=g}else{i=c[a+(h+16)>>2]|0;n=c[a+(h|4)>>2]|0;do{if((n|0)==(k|0)){n=a+(h+12)|0;j=c[n>>2]|0;if((j|0)==0){n=a+(h+8)|0;j=c[n>>2]|0;if((j|0)==0){g=0;break}}while(1){p=j+20|0;o=c[p>>2]|0;if((o|0)!=0){j=o;n=p;continue}o=j+16|0;p=c[o>>2]|0;if((p|0)==0){break}else{j=p;n=o}}if(n>>>0<(c[6836]|0)>>>0){dc()}else{c[n>>2]=0;g=j;break}}else{o=c[a+h>>2]|0;if(o>>>0<(c[6836]|0)>>>0){dc()}p=o+12|0;if((c[p>>2]|0)!=(k|0)){dc()}j=n+8|0;if((c[j>>2]|0)==(k|0)){c[p>>2]=n;c[j>>2]=o;g=n;break}else{dc()}}}while(0);if((i|0)==0){break}n=a+(h+20)|0;j=27632+(c[n>>2]<<2)|0;do{if((k|0)==(c[j>>2]|0)){c[j>>2]=g;if((g|0)!=0){break}c[6833]=c[6833]&~(1<<c[n>>2]);break b}else{if(i>>>0<(c[6836]|0)>>>0){dc()}j=i+16|0;if((c[j>>2]|0)==(k|0)){c[j>>2]=g}else{c[i+20>>2]=g}if((g|0)==0){break b}}}while(0);if(g>>>0<(c[6836]|0)>>>0){dc()}c[g+24>>2]=i;i=c[a+(h+8)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[6836]|0)>>>0){dc()}else{c[g+16>>2]=i;c[i+24>>2]=g;break}}}while(0);h=c[a+(h+12)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[6836]|0)>>>0){dc()}else{c[g+20>>2]=h;c[h+24>>2]=g;break}}}while(0);c[b+4>>2]=l|1;c[m+l>>2]=l;if((b|0)!=(c[6837]|0)){break}c[6834]=l;return}else{c[n>>2]=o&-2;c[b+4>>2]=l|1;c[m+l>>2]=l}}while(0);g=l>>>3;if(l>>>0<256>>>0){a=g<<1;d=27368+(a<<2)|0;h=c[6832]|0;g=1<<g;do{if((h&g|0)==0){c[6832]=h|g;f=d;e=27368+(a+2<<2)|0}else{h=27368+(a+2<<2)|0;g=c[h>>2]|0;if(g>>>0>=(c[6836]|0)>>>0){f=g;e=h;break}dc()}}while(0);c[e>>2]=b;c[f+12>>2]=b;c[b+8>>2]=f;c[b+12>>2]=d;return}e=b;f=l>>>8;do{if((f|0)==0){g=0}else{if(l>>>0>16777215>>>0){g=31;break}v=(f+1048320|0)>>>16&8;w=f<<v;u=(w+520192|0)>>>16&4;w=w<<u;g=(w+245760|0)>>>16&2;g=14-(u|v|g)+(w<<g>>>15)|0;g=l>>>((g+7|0)>>>0)&1|g<<1}}while(0);h=27632+(g<<2)|0;c[b+28>>2]=g;c[b+20>>2]=0;c[b+16>>2]=0;a=c[6833]|0;f=1<<g;c:do{if((a&f|0)==0){c[6833]=a|f;c[h>>2]=e;c[b+24>>2]=h;c[b+12>>2]=b;c[b+8>>2]=b}else{f=c[h>>2]|0;if((g|0)==31){g=0}else{g=25-(g>>>1)|0}d:do{if((c[f+4>>2]&-8|0)==(l|0)){d=f}else{h=l<<g;while(1){g=f+16+(h>>>31<<2)|0;a=c[g>>2]|0;if((a|0)==0){break}if((c[a+4>>2]&-8|0)==(l|0)){d=a;break d}else{f=a;h=h<<1}}if(g>>>0<(c[6836]|0)>>>0){dc()}else{c[g>>2]=e;c[b+24>>2]=f;c[b+12>>2]=b;c[b+8>>2]=b;break c}}}while(0);g=d+8|0;f=c[g>>2]|0;h=c[6836]|0;if(d>>>0<h>>>0){dc()}if(f>>>0<h>>>0){dc()}else{c[f+12>>2]=e;c[g>>2]=e;c[b+8>>2]=f;c[b+12>>2]=d;c[b+24>>2]=0;break}}}while(0);w=(c[6840]|0)-1|0;c[6840]=w;if((w|0)==0){b=27784}else{return}while(1){b=c[b>>2]|0;if((b|0)==0){break}else{b=b+8|0}}c[6840]=-1;return}function sp(a,b){a=a|0;b=b|0;var d=0,e=0;if((a|0)==0){e=qp(b)|0;return e|0}if(b>>>0>4294967231>>>0){c[(Ub()|0)>>2]=12;e=0;return e|0}if(b>>>0<11>>>0){d=16}else{d=b+11&-8}d=tp(a-8|0,d)|0;if((d|0)!=0){e=d+8|0;return e|0}d=qp(b)|0;if((d|0)==0){e=0;return e|0}e=c[a-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;Np(d|0,a|0,e>>>0<b>>>0?e:b)|0;rp(a);e=d;return e|0}function tp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;f=c[d>>2]|0;h=f&-8;e=a;j=e+h|0;k=j;i=c[6836]|0;if(e>>>0<i>>>0){dc();return 0}m=f&3;if(!((m|0)!=1&e>>>0<j>>>0)){dc();return 0}g=e+(h|4)|0;l=c[g>>2]|0;if((l&1|0)==0){dc();return 0}if((m|0)==0){if(b>>>0<256>>>0){o=0;return o|0}do{if(h>>>0>=(b+4|0)>>>0){if((h-b|0)>>>0>c[6822]<<1>>>0){break}return a|0}}while(0);o=0;return o|0}if(h>>>0>=b>>>0){h=h-b|0;if(h>>>0<=15>>>0){o=a;return o|0}c[d>>2]=f&1|b|2;c[e+(b+4)>>2]=h|3;c[g>>2]=c[g>>2]|1;up(e+b|0,h);o=a;return o|0}if((k|0)==(c[6838]|0)){g=(c[6835]|0)+h|0;if(g>>>0<=b>>>0){o=0;return o|0}o=g-b|0;c[d>>2]=f&1|b|2;c[e+(b+4)>>2]=o|1;c[6838]=e+b;c[6835]=o;o=a;return o|0}if((k|0)==(c[6837]|0)){h=(c[6834]|0)+h|0;if(h>>>0<b>>>0){o=0;return o|0}g=h-b|0;if(g>>>0>15>>>0){c[d>>2]=f&1|b|2;c[e+(b+4)>>2]=g|1;c[e+h>>2]=g;d=e+(h+4)|0;c[d>>2]=c[d>>2]&-2;d=e+b|0}else{c[d>>2]=f&1|h|2;d=e+(h+4)|0;c[d>>2]=c[d>>2]|1;d=0;g=0}c[6834]=g;c[6837]=d;o=a;return o|0}if((l&2|0)!=0){o=0;return o|0}g=(l&-8)+h|0;if(g>>>0<b>>>0){o=0;return o|0}f=g-b|0;m=l>>>3;a:do{if(l>>>0<256>>>0){j=c[e+(h+8)>>2]|0;h=c[e+(h+12)>>2]|0;l=27368+(m<<1<<2)|0;do{if((j|0)!=(l|0)){if(j>>>0<i>>>0){dc();return 0}if((c[j+12>>2]|0)==(k|0)){break}dc();return 0}}while(0);if((h|0)==(j|0)){c[6832]=c[6832]&~(1<<m);break}do{if((h|0)==(l|0)){i=h+8|0}else{if(h>>>0<i>>>0){dc();return 0}i=h+8|0;if((c[i>>2]|0)==(k|0)){break}dc();return 0}}while(0);c[j+12>>2]=h;c[i>>2]=j}else{k=c[e+(h+24)>>2]|0;l=c[e+(h+12)>>2]|0;do{if((l|0)==(j|0)){m=e+(h+20)|0;l=c[m>>2]|0;if((l|0)==0){m=e+(h+16)|0;l=c[m>>2]|0;if((l|0)==0){l=0;break}}while(1){o=l+20|0;n=c[o>>2]|0;if((n|0)!=0){l=n;m=o;continue}o=l+16|0;n=c[o>>2]|0;if((n|0)==0){break}else{l=n;m=o}}if(m>>>0<i>>>0){dc();return 0}else{c[m>>2]=0;break}}else{m=c[e+(h+8)>>2]|0;if(m>>>0<i>>>0){dc();return 0}n=m+12|0;if((c[n>>2]|0)!=(j|0)){dc();return 0}i=l+8|0;if((c[i>>2]|0)==(j|0)){c[n>>2]=l;c[i>>2]=m;break}else{dc();return 0}}}while(0);if((k|0)==0){break}m=e+(h+28)|0;i=27632+(c[m>>2]<<2)|0;do{if((j|0)==(c[i>>2]|0)){c[i>>2]=l;if((l|0)!=0){break}c[6833]=c[6833]&~(1<<c[m>>2]);break a}else{if(k>>>0<(c[6836]|0)>>>0){dc();return 0}i=k+16|0;if((c[i>>2]|0)==(j|0)){c[i>>2]=l}else{c[k+20>>2]=l}if((l|0)==0){break a}}}while(0);if(l>>>0<(c[6836]|0)>>>0){dc();return 0}c[l+24>>2]=k;i=c[e+(h+16)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[l+16>>2]=i;c[i+24>>2]=l;break}}}while(0);h=c[e+(h+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[6836]|0)>>>0){dc();return 0}else{c[l+20>>2]=h;c[h+24>>2]=l;break}}}while(0);if(f>>>0<16>>>0){c[d>>2]=g|c[d>>2]&1|2;o=e+(g|4)|0;c[o>>2]=c[o>>2]|1;o=a;return o|0}else{c[d>>2]=c[d>>2]&1|b|2;c[e+(b+4)>>2]=f|3;o=e+(g|4)|0;c[o>>2]=c[o>>2]|1;up(e+b|0,f);o=a;return o|0}return 0}function up(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;h=a;k=h+b|0;j=k;l=c[a+4>>2]|0;a:do{if((l&1|0)==0){o=c[a>>2]|0;if((l&3|0)==0){return}r=h+(-o|0)|0;a=r;l=o+b|0;p=c[6836]|0;if(r>>>0<p>>>0){dc()}if((a|0)==(c[6837]|0)){d=h+(b+4)|0;if((c[d>>2]&3|0)!=3){d=a;m=l;break}c[6834]=l;c[d>>2]=c[d>>2]&-2;c[h+(4-o)>>2]=l|1;c[k>>2]=l;return}s=o>>>3;if(o>>>0<256>>>0){d=c[h+(8-o)>>2]|0;m=c[h+(12-o)>>2]|0;n=27368+(s<<1<<2)|0;do{if((d|0)!=(n|0)){if(d>>>0<p>>>0){dc()}if((c[d+12>>2]|0)==(a|0)){break}dc()}}while(0);if((m|0)==(d|0)){c[6832]=c[6832]&~(1<<s);d=a;m=l;break}do{if((m|0)==(n|0)){q=m+8|0}else{if(m>>>0<p>>>0){dc()}n=m+8|0;if((c[n>>2]|0)==(a|0)){q=n;break}dc()}}while(0);c[d+12>>2]=m;c[q>>2]=d;d=a;m=l;break}q=c[h+(24-o)>>2]|0;s=c[h+(12-o)>>2]|0;do{if((s|0)==(r|0)){u=16-o|0;t=h+(u+4)|0;s=c[t>>2]|0;if((s|0)==0){t=h+u|0;s=c[t>>2]|0;if((s|0)==0){n=0;break}}while(1){u=s+20|0;v=c[u>>2]|0;if((v|0)!=0){s=v;t=u;continue}v=s+16|0;u=c[v>>2]|0;if((u|0)==0){break}else{s=u;t=v}}if(t>>>0<p>>>0){dc()}else{c[t>>2]=0;n=s;break}}else{t=c[h+(8-o)>>2]|0;if(t>>>0<p>>>0){dc()}p=t+12|0;if((c[p>>2]|0)!=(r|0)){dc()}u=s+8|0;if((c[u>>2]|0)==(r|0)){c[p>>2]=s;c[u>>2]=t;n=s;break}else{dc()}}}while(0);if((q|0)==0){d=a;m=l;break}p=h+(28-o)|0;s=27632+(c[p>>2]<<2)|0;do{if((r|0)==(c[s>>2]|0)){c[s>>2]=n;if((n|0)!=0){break}c[6833]=c[6833]&~(1<<c[p>>2]);d=a;m=l;break a}else{if(q>>>0<(c[6836]|0)>>>0){dc()}p=q+16|0;if((c[p>>2]|0)==(r|0)){c[p>>2]=n}else{c[q+20>>2]=n}if((n|0)==0){d=a;m=l;break a}}}while(0);if(n>>>0<(c[6836]|0)>>>0){dc()}c[n+24>>2]=q;p=16-o|0;o=c[h+p>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[6836]|0)>>>0){dc()}else{c[n+16>>2]=o;c[o+24>>2]=n;break}}}while(0);o=c[h+(p+4)>>2]|0;if((o|0)==0){d=a;m=l;break}if(o>>>0<(c[6836]|0)>>>0){dc()}else{c[n+20>>2]=o;c[o+24>>2]=n;d=a;m=l;break}}else{d=a;m=b}}while(0);l=c[6836]|0;if(k>>>0<l>>>0){dc()}a=h+(b+4)|0;n=c[a>>2]|0;do{if((n&2|0)==0){if((j|0)==(c[6838]|0)){v=(c[6835]|0)+m|0;c[6835]=v;c[6838]=d;c[d+4>>2]=v|1;if((d|0)!=(c[6837]|0)){return}c[6837]=0;c[6834]=0;return}if((j|0)==(c[6837]|0)){v=(c[6834]|0)+m|0;c[6834]=v;c[6837]=d;c[d+4>>2]=v|1;c[d+v>>2]=v;return}m=(n&-8)+m|0;a=n>>>3;b:do{if(n>>>0<256>>>0){g=c[h+(b+8)>>2]|0;b=c[h+(b+12)>>2]|0;h=27368+(a<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<l>>>0){dc()}if((c[g+12>>2]|0)==(j|0)){break}dc()}}while(0);if((b|0)==(g|0)){c[6832]=c[6832]&~(1<<a);break}do{if((b|0)==(h|0)){i=b+8|0}else{if(b>>>0<l>>>0){dc()}h=b+8|0;if((c[h>>2]|0)==(j|0)){i=h;break}dc()}}while(0);c[g+12>>2]=b;c[i>>2]=g}else{i=c[h+(b+24)>>2]|0;j=c[h+(b+12)>>2]|0;do{if((j|0)==(k|0)){a=h+(b+20)|0;j=c[a>>2]|0;if((j|0)==0){a=h+(b+16)|0;j=c[a>>2]|0;if((j|0)==0){g=0;break}}while(1){o=j+20|0;n=c[o>>2]|0;if((n|0)!=0){j=n;a=o;continue}n=j+16|0;o=c[n>>2]|0;if((o|0)==0){break}else{j=o;a=n}}if(a>>>0<l>>>0){dc()}else{c[a>>2]=0;g=j;break}}else{a=c[h+(b+8)>>2]|0;if(a>>>0<l>>>0){dc()}n=a+12|0;if((c[n>>2]|0)!=(k|0)){dc()}l=j+8|0;if((c[l>>2]|0)==(k|0)){c[n>>2]=j;c[l>>2]=a;g=j;break}else{dc()}}}while(0);if((i|0)==0){break}j=h+(b+28)|0;l=27632+(c[j>>2]<<2)|0;do{if((k|0)==(c[l>>2]|0)){c[l>>2]=g;if((g|0)!=0){break}c[6833]=c[6833]&~(1<<c[j>>2]);break b}else{if(i>>>0<(c[6836]|0)>>>0){dc()}j=i+16|0;if((c[j>>2]|0)==(k|0)){c[j>>2]=g}else{c[i+20>>2]=g}if((g|0)==0){break b}}}while(0);if(g>>>0<(c[6836]|0)>>>0){dc()}c[g+24>>2]=i;i=c[h+(b+16)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[6836]|0)>>>0){dc()}else{c[g+16>>2]=i;c[i+24>>2]=g;break}}}while(0);b=c[h+(b+20)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[6836]|0)>>>0){dc()}else{c[g+20>>2]=b;c[b+24>>2]=g;break}}}while(0);c[d+4>>2]=m|1;c[d+m>>2]=m;if((d|0)!=(c[6837]|0)){break}c[6834]=m;return}else{c[a>>2]=n&-2;c[d+4>>2]=m|1;c[d+m>>2]=m}}while(0);g=m>>>3;if(m>>>0<256>>>0){h=g<<1;b=27368+(h<<2)|0;i=c[6832]|0;g=1<<g;do{if((i&g|0)==0){c[6832]=i|g;e=b;f=27368+(h+2<<2)|0}else{g=27368+(h+2<<2)|0;h=c[g>>2]|0;if(h>>>0>=(c[6836]|0)>>>0){e=h;f=g;break}dc()}}while(0);c[f>>2]=d;c[e+12>>2]=d;c[d+8>>2]=e;c[d+12>>2]=b;return}e=d;f=m>>>8;do{if((f|0)==0){b=0}else{if(m>>>0>16777215>>>0){b=31;break}u=(f+1048320|0)>>>16&8;v=f<<u;t=(v+520192|0)>>>16&4;v=v<<t;b=(v+245760|0)>>>16&2;b=14-(t|u|b)+(v<<b>>>15)|0;b=m>>>((b+7|0)>>>0)&1|b<<1}}while(0);f=27632+(b<<2)|0;c[d+28>>2]=b;c[d+20>>2]=0;c[d+16>>2]=0;h=c[6833]|0;g=1<<b;if((h&g|0)==0){c[6833]=h|g;c[f>>2]=e;c[d+24>>2]=f;c[d+12>>2]=d;c[d+8>>2]=d;return}f=c[f>>2]|0;if((b|0)==31){b=0}else{b=25-(b>>>1)|0}c:do{if((c[f+4>>2]&-8|0)!=(m|0)){h=m<<b;while(1){g=f+16+(h>>>31<<2)|0;b=c[g>>2]|0;if((b|0)==0){break}if((c[b+4>>2]&-8|0)==(m|0)){f=b;break c}else{f=b;h=h<<1}}if(g>>>0<(c[6836]|0)>>>0){dc()}c[g>>2]=e;c[d+24>>2]=f;c[d+12>>2]=d;c[d+8>>2]=d;return}}while(0);g=f+8|0;b=c[g>>2]|0;h=c[6836]|0;if(f>>>0<h>>>0){dc()}if(b>>>0<h>>>0){dc()}c[b+12>>2]=e;c[g>>2]=e;c[d+8>>2]=b;c[d+12>>2]=f;c[d+24>>2]=0;return}function vp(a){a=a|0;var b=0,d=0;a=(a|0)==0?1:a;while(1){b=qp(a)|0;if((b|0)!=0){a=10;break}b=(J=c[7838]|0,c[7838]=J+0,J);if((b|0)==0){a=9;break}y=0;Ia(b|0);if(y){y=0;a=5;break}}do{if((a|0)==5){b=Mb(-1,-1)|0;d=L}else if((a|0)==9){d=lc(4)|0;c[d>>2]=19536;y=0;Ha(16,d|0,25576,40);if(!y){return 0}else{y=0;b=Mb(-1,-1)|0;d=L;break}}else if((a|0)==10){return b|0}}while(0);if((d|0)<0){Sb(b|0);return 0}else{db(b|0)}return 0}function wp(a){a=a|0;a=(y=0,ra(130,a|0)|0);if(!y){return a|0}else{y=0}a=Mb(-1,-1)|0;if((L|0)<0){Sb(a|0);return 0}else{db(a|0)}return 0}function xp(a){a=a|0;if((a|0)==0){return}rp(a);return}function yp(a){a=a|0;xp(a);return}function zp(a){a=a|0;xp(a);return}function Ap(a){a=a|0;return}function Bp(a){a=a|0;return 14008}function Cp(){var a=0;a=lc(4)|0;c[a>>2]=19536;Hb(a|0,25576,40)}function Dp(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0.0,J=0,K=0,M=0.0,N=0.0,O=0.0,P=0.0;g=i;i=i+512|0;k=g|0;if((e|0)==0){j=-149;h=24}else if((e|0)==1){j=-1074;h=53}else if((e|0)==2){j=-1074;h=53}else{N=0.0;i=g;return+N}n=b+4|0;o=b+100|0;do{e=c[n>>2]|0;if(e>>>0<(c[o>>2]|0)>>>0){c[n>>2]=e+1;D=d[e]|0}else{D=Gp(b)|0}}while((Wa(D|0)|0)!=0);do{if((D|0)==45|(D|0)==43){e=1-(((D|0)==45)<<1)|0;l=c[n>>2]|0;if(l>>>0<(c[o>>2]|0)>>>0){c[n>>2]=l+1;D=d[l]|0;break}else{D=Gp(b)|0;break}}else{e=1}}while(0);l=0;do{if((D|32|0)!=(a[12304+l|0]|0)){break}do{if(l>>>0<7>>>0){m=c[n>>2]|0;if(m>>>0<(c[o>>2]|0)>>>0){c[n>>2]=m+1;D=d[m]|0;break}else{D=Gp(b)|0;break}}}while(0);l=l+1|0;}while(l>>>0<8>>>0);do{if((l|0)==3){q=23}else if((l|0)!=8){p=(f|0)==0;if(!(l>>>0<4>>>0|p)){if((l|0)==8){break}else{q=23;break}}a:do{if((l|0)==0){l=0;do{if((D|32|0)!=(a[16400+l|0]|0)){break a}do{if(l>>>0<2>>>0){m=c[n>>2]|0;if(m>>>0<(c[o>>2]|0)>>>0){c[n>>2]=m+1;D=d[m]|0;break}else{D=Gp(b)|0;break}}}while(0);l=l+1|0;}while(l>>>0<3>>>0)}}while(0);if((l|0)==3){e=c[n>>2]|0;if(e>>>0<(c[o>>2]|0)>>>0){c[n>>2]=e+1;e=d[e]|0}else{e=Gp(b)|0}if((e|0)==40){e=1}else{if((c[o>>2]|0)==0){N=+w;i=g;return+N}c[n>>2]=(c[n>>2]|0)-1;N=+w;i=g;return+N}while(1){h=c[n>>2]|0;if(h>>>0<(c[o>>2]|0)>>>0){c[n>>2]=h+1;h=d[h]|0}else{h=Gp(b)|0}if(!((h-48|0)>>>0<10>>>0|(h-65|0)>>>0<26>>>0)){if(!((h-97|0)>>>0<26>>>0|(h|0)==95)){break}}e=e+1|0}if((h|0)==41){N=+w;i=g;return+N}h=(c[o>>2]|0)==0;if(!h){c[n>>2]=(c[n>>2]|0)-1}if(p){c[(Ub()|0)>>2]=22;Fp(b,0);N=0.0;i=g;return+N}if((e|0)==0|h){N=+w;i=g;return+N}while(1){e=e-1|0;c[n>>2]=(c[n>>2]|0)-1;if((e|0)==0){s=+w;break}}i=g;return+s}else if((l|0)==0){do{if((D|0)==48){l=c[n>>2]|0;if(l>>>0<(c[o>>2]|0)>>>0){c[n>>2]=l+1;l=d[l]|0}else{l=Gp(b)|0}if((l|32|0)!=120){if((c[o>>2]|0)==0){D=48;break}c[n>>2]=(c[n>>2]|0)-1;D=48;break}k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;v=d[k]|0;A=0}else{v=Gp(b)|0;A=0}while(1){if((v|0)==46){q=70;break}else if((v|0)!=48){l=0;k=0;m=0;r=0;u=0;B=0;I=1.0;s=0.0;t=0;break}k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;v=d[k]|0;A=1;continue}else{v=Gp(b)|0;A=1;continue}}b:do{if((q|0)==70){k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;v=d[k]|0}else{v=Gp(b)|0}if((v|0)==48){m=-1;r=-1}else{l=0;k=0;m=0;r=0;u=1;B=0;I=1.0;s=0.0;t=0;break}while(1){k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;v=d[k]|0}else{v=Gp(b)|0}if((v|0)!=48){l=0;k=0;A=1;u=1;B=0;I=1.0;s=0.0;t=0;break b}K=Tp(r,m,-1,-1)|0;m=L;r=K}}}while(0);c:while(1){C=v-48|0;do{if(C>>>0<10>>>0){q=84}else{z=v|32;y=(v|0)==46;if(!((z-97|0)>>>0<6>>>0|y)){break c}if(y){if((u|0)==0){z=l;y=k;m=l;r=k;u=1;break}else{v=46;break c}}else{C=(v|0)>57?z-87|0:C;q=84;break}}}while(0);if((q|0)==84){q=0;K=0;do{if((l|0)<(K|0)|(l|0)==(K|0)&k>>>0<8>>>0){M=I;t=C+(t<<4)|0}else{K=0;if((l|0)<(K|0)|(l|0)==(K|0)&k>>>0<14>>>0){N=I*.0625;M=N;s=s+N*+(C|0);break}if(!((C|0)!=0&(B|0)==0)){M=I;break}B=1;M=I;s=s+I*.5}}while(0);y=Tp(k,l,1,0)|0;z=L;A=1;I=M}k=c[n>>2]|0;if(k>>>0<(c[o>>2]|0)>>>0){c[n>>2]=k+1;v=d[k]|0;l=z;k=y;continue}else{v=Gp(b)|0;l=z;k=y;continue}}if((A|0)==0){h=(c[o>>2]|0)==0;if(!h){c[n>>2]=(c[n>>2]|0)-1}do{if(p){Fp(b,0)}else{if(h){break}h=c[n>>2]|0;c[n>>2]=h-1;if((u|0)==0){break}c[n>>2]=h-2}}while(0);N=+(e|0)*0.0;i=g;return+N}u=(u|0)==0;q=u?k:r;m=u?l:m;K=0;if((l|0)<(K|0)|(l|0)==(K|0)&k>>>0<8>>>0){do{t=t<<4;k=Tp(k,l,1,0)|0;l=L;K=0;}while((l|0)<(K|0)|(l|0)==(K|0)&k>>>0<8>>>0)}do{if((v|32|0)==112){k=Ep(b,f)|0;l=L;if(!((k|0)==0&(l|0)==(-2147483648|0))){break}if(p){Fp(b,0);N=0.0;i=g;return+N}else{if((c[o>>2]|0)==0){l=0;k=0;break}c[n>>2]=(c[n>>2]|0)-1;l=0;k=0;break}}else{if((c[o>>2]|0)==0){l=0;k=0;break}c[n>>2]=(c[n>>2]|0)-1;l=0;k=0}}while(0);K=Tp(q<<2|0>>>30,m<<2|q>>>30,-32,-1)|0;k=Tp(K,L,k,l)|0;l=L;if((t|0)==0){N=+(e|0)*0.0;i=g;return+N}K=0;if((l|0)>(K|0)|(l|0)==(K|0)&k>>>0>(-j|0)>>>0){c[(Ub()|0)>>2]=34;N=+(e|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+N}m=j-106|0;K=(m|0)<0|0?-1:0;if((l|0)<(K|0)|(l|0)==(K|0)&k>>>0<m>>>0){c[(Ub()|0)>>2]=34;N=+(e|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+N}if((t|0)>-1){do{t=t<<1;if(s<.5){I=s}else{I=s+-1.0;t=t|1}s=s+I;k=Tp(k,l,-1,-1)|0;l=L;}while((t|0)>-1)}m=0;j=Up(32,0,j,(j|0)<0|0?-1:0)|0;j=Tp(k,l,j,L)|0;K=L;if((m|0)>(K|0)|(m|0)==(K|0)&h>>>0>j>>>0){h=(j|0)<0?0:j}do{if((h|0)<53){I=+(e|0);M=+Eb(+(+Hp(1.0,84-h|0)),+I);if(!((h|0)<32&s!=0.0)){break}e=t&1;s=(e|0)==0?0.0:s;t=(e^1)+t|0}else{M=0.0;I=+(e|0)}}while(0);s=I*s+(M+I*+(t>>>0>>>0))-M;if(s==0.0){c[(Ub()|0)>>2]=34}N=+Ip(s,k);i=g;return+N}}while(0);m=j+h|0;l=-m|0;C=0;while(1){if((D|0)==46){q=139;break}else if((D|0)!=48){F=0;v=0;u=0;break}r=c[n>>2]|0;if(r>>>0<(c[o>>2]|0)>>>0){c[n>>2]=r+1;D=d[r]|0;C=1;continue}else{D=Gp(b)|0;C=1;continue}}d:do{if((q|0)==139){r=c[n>>2]|0;if(r>>>0<(c[o>>2]|0)>>>0){c[n>>2]=r+1;D=d[r]|0}else{D=Gp(b)|0}if((D|0)==48){v=-1;u=-1}else{F=1;v=0;u=0;break}while(1){r=c[n>>2]|0;if(r>>>0<(c[o>>2]|0)>>>0){c[n>>2]=r+1;D=d[r]|0}else{D=Gp(b)|0}if((D|0)!=48){F=1;C=1;break d}K=Tp(u,v,-1,-1)|0;v=L;u=K}}}while(0);r=k|0;c[r>>2]=0;H=D-48|0;G=(D|0)==46;e:do{if(H>>>0<10>>>0|G){t=k+496|0;E=0;B=0;y=0;A=0;z=0;while(1){do{if(G){if((F|0)==0){F=1;J=E;K=B;v=E;u=B}else{break e}}else{B=Tp(B,E,1,0)|0;E=L;G=(D|0)!=48;if((A|0)>=125){if(!G){J=E;K=B;break}c[t>>2]=c[t>>2]|1;J=E;K=B;break}C=k+(A<<2)|0;if((z|0)!=0){H=D-48+((c[C>>2]|0)*10|0)|0}c[C>>2]=H;z=z+1|0;C=(z|0)==9;z=C?0:z;A=(C&1)+A|0;C=1;y=G?B:y;J=E;K=B}}while(0);B=c[n>>2]|0;if(B>>>0<(c[o>>2]|0)>>>0){c[n>>2]=B+1;D=d[B]|0}else{D=Gp(b)|0}H=D-48|0;G=(D|0)==46;if(H>>>0<10>>>0|G){E=J;B=K}else{E=J;B=K;q=162;break}}}else{E=0;B=0;y=0;A=0;z=0;q=162}}while(0);if((q|0)==162){t=(F|0)==0;v=t?E:v;u=t?B:u}t=(C|0)!=0;do{if(t){if((D|32|0)!=101){q=171;break}f=Ep(b,f)|0;C=L;do{if((f|0)==0&(C|0)==(-2147483648|0)){if(p){Fp(b,0);N=0.0;i=g;return+N}else{if((c[o>>2]|0)==0){C=0;f=0;break}c[n>>2]=(c[n>>2]|0)-1;C=0;f=0;break}}}while(0);u=Tp(f,C,u,v)|0;v=L}else{q=171}}while(0);do{if((q|0)==171){if((D|0)<=-1){break}if((c[o>>2]|0)==0){break}c[n>>2]=(c[n>>2]|0)-1}}while(0);if(!t){c[(Ub()|0)>>2]=22;Fp(b,0);N=0.0;i=g;return+N}b=c[r>>2]|0;if((b|0)==0){N=+(e|0)*0.0;i=g;return+N}K=0;do{if((u|0)==(B|0)&(v|0)==(E|0)&((E|0)<(K|0)|(E|0)==(K|0)&B>>>0<10>>>0)){if(h>>>0<=30>>>0){if((b>>>(h>>>0)|0)!=0){break}}N=+(e|0)*+(b>>>0>>>0);i=g;return+N}}while(0);b=(j|0)/-2|0;K=(b|0)<0|0?-1:0;if((v|0)>(K|0)|(v|0)==(K|0)&u>>>0>b>>>0){c[(Ub()|0)>>2]=34;N=+(e|0)*1.7976931348623157e+308*1.7976931348623157e+308;i=g;return+N}b=j-106|0;K=(b|0)<0|0?-1:0;if((v|0)<(K|0)|(v|0)==(K|0)&u>>>0<b>>>0){c[(Ub()|0)>>2]=34;N=+(e|0)*2.2250738585072014e-308*2.2250738585072014e-308;i=g;return+N}if((z|0)!=0){if((z|0)<9){b=k+(A<<2)|0;n=c[b>>2]|0;do{n=n*10|0;z=z+1|0;}while((z|0)<9);c[b>>2]=n}A=A+1|0}do{if((y|0)<9){if(!((y|0)<=(u|0)&(u|0)<18)){break}if((u|0)==9){N=+(e|0)*+((c[r>>2]|0)>>>0>>>0);i=g;return+N}if((u|0)<9){N=+(e|0)*+((c[r>>2]|0)>>>0>>>0)/+(c[2800+(8-u<<2)>>2]|0);i=g;return+N}b=h+27+(u*-3|0)|0;n=c[r>>2]|0;if((b|0)<=30){if((n>>>(b>>>0)|0)!=0){break}}N=+(e|0)*+(n>>>0>>>0)*+(c[2800+(u-10<<2)>>2]|0);i=g;return+N}}while(0);b=(u|0)%9|0;if((b|0)==0){b=0;n=0}else{o=(u|0)>-1?b:b+9|0;f=c[2800+(8-o<<2)>>2]|0;do{if((A|0)==0){A=0;b=0}else{n=1e9/(f|0)|0;b=0;r=0;q=0;while(1){J=k+(r<<2)|0;p=c[J>>2]|0;K=((p>>>0)/(f>>>0)|0)+q|0;c[J>>2]=K;q=ha((p>>>0)%(f>>>0)|0,n)|0;p=r+1|0;if((r|0)==(b|0)&(K|0)==0){b=p&127;u=u-9|0}if((p|0)==(A|0)){break}else{r=p}}if((q|0)==0){break}c[k+(A<<2)>>2]=q;A=A+1|0}}while(0);n=0;u=9-o+u|0}f:while(1){o=k+(b<<2)|0;if((u|0)<18){do{f=0;o=A+127|0;while(1){o=o&127;p=k+(o<<2)|0;q=c[p>>2]|0;q=Tp(q<<29|0>>>3,0<<29|q>>>3,f,0)|0;f=L;K=0;if(f>>>0>K>>>0|f>>>0==K>>>0&q>>>0>1e9>>>0){K=cq(q,f,1e9,0)|0;q=dq(q,f,1e9,0)|0;f=K}else{f=0}c[p>>2]=q;p=(o|0)==(b|0);if(!((o|0)!=(A+127&127|0)|p)){A=(q|0)==0?o:A}if(p){break}else{o=o-1|0}}n=n-29|0;}while((f|0)==0)}else{if((u|0)!=18){break}do{if((c[o>>2]|0)>>>0>=9007199>>>0){u=18;break f}f=0;p=A+127|0;while(1){p=p&127;q=k+(p<<2)|0;r=c[q>>2]|0;r=Tp(r<<29|0>>>3,0<<29|r>>>3,f,0)|0;f=L;K=0;if(f>>>0>K>>>0|f>>>0==K>>>0&r>>>0>1e9>>>0){K=cq(r,f,1e9,0)|0;r=dq(r,f,1e9,0)|0;f=K}else{f=0}c[q>>2]=r;q=(p|0)==(b|0);if(!((p|0)!=(A+127&127|0)|q)){A=(r|0)==0?p:A}if(q){break}else{p=p-1|0}}n=n-29|0;}while((f|0)==0)}b=b+127&127;if((b|0)==(A|0)){K=A+127&127;A=k+((A+126&127)<<2)|0;c[A>>2]=c[A>>2]|c[k+(K<<2)>>2];A=K}c[k+(b<<2)>>2]=f;u=u+9|0}g:while(1){o=A+1&127;f=k+((A+127&127)<<2)|0;while(1){q=(u|0)==18;p=(u|0)>27?9:1;while(1){r=0;while(1){t=r+b&127;if((t|0)==(A|0)){r=2;break}v=c[k+(t<<2)>>2]|0;t=c[2792+(r<<2)>>2]|0;if(v>>>0<t>>>0){r=2;break}y=r+1|0;if(v>>>0>t>>>0){break}if((y|0)<2){r=y}else{r=y;break}}if((r|0)==2&q){break g}n=p+n|0;if((b|0)==(A|0)){b=A}else{break}}r=(1<<p)-1|0;q=1e9>>>(p>>>0);t=b;v=b;b=0;do{J=k+(v<<2)|0;K=c[J>>2]|0;y=(K>>>(p>>>0))+b|0;c[J>>2]=y;b=ha(K&r,q)|0;y=(v|0)==(t|0)&(y|0)==0;v=v+1&127;u=y?u-9|0:u;t=y?v:t;}while((v|0)!=(A|0));if((b|0)==0){b=t;continue}if((o|0)!=(t|0)){break}c[f>>2]=c[f>>2]|1;b=t}c[k+(A<<2)>>2]=b;b=t;A=o}f=b&127;if((f|0)==(A|0)){c[k+(o-1<<2)>>2]=0;A=o}I=+((c[k+(f<<2)>>2]|0)>>>0>>>0);o=b+1&127;if((o|0)==(A|0)){A=A+1&127;c[k+(A-1<<2)>>2]=0}s=+(e|0);M=s*(I*1.0e9+ +((c[k+(o<<2)>>2]|0)>>>0>>>0));o=n+53|0;e=o-j|0;if((e|0)<(h|0)){h=(e|0)<0?0:e;j=1}else{j=0}if((h|0)<53){P=+Eb(+(+Hp(1.0,105-h|0)),+M);O=+cb(+M,+(+Hp(1.0,53-h|0)));I=P;N=O;M=P+(M-O)}else{I=0.0;N=0.0}f=b+2&127;do{if((f|0)!=(A|0)){k=c[k+(f<<2)>>2]|0;do{if(k>>>0<5e8>>>0){if((k|0)==0){if((b+3&127|0)==(A|0)){break}}N=s*.25+N}else{if(k>>>0>5e8>>>0){N=s*.75+N;break}if((b+3&127|0)==(A|0)){N=s*.5+N;break}else{N=s*.75+N;break}}}while(0);if((53-h|0)<=1){break}if(+cb(+N,+1.0)!=0.0){break}N=N+1.0}}while(0);s=M+N-I;do{if((o&2147483647|0)>(-2-m|0)){if(+W(+s)>=9007199254740992.0){s=s*.5;j=(j|0)!=0&(h|0)==(e|0)?0:j;n=n+1|0}if((n+50|0)<=(l|0)){if(!((j|0)!=0&N!=0.0)){break}}c[(Ub()|0)>>2]=34}}while(0);P=+Ip(s,n);i=g;return+P}else{if((c[o>>2]|0)!=0){c[n>>2]=(c[n>>2]|0)-1}c[(Ub()|0)>>2]=22;Fp(b,0);P=0.0;i=g;return+P}}}while(0);do{if((q|0)==23){h=(c[o>>2]|0)==0;if(!h){c[n>>2]=(c[n>>2]|0)-1}if(l>>>0<4>>>0|(f|0)==0|h){break}do{c[n>>2]=(c[n>>2]|0)-1;l=l-1|0;}while(l>>>0>3>>>0)}}while(0);P=+(e|0)*x;i=g;return+P}function Ep(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=a+4|0;g=c[e>>2]|0;f=a+100|0;if(g>>>0<(c[f>>2]|0)>>>0){c[e>>2]=g+1;h=d[g]|0}else{h=Gp(a)|0}do{if((h|0)==45|(h|0)==43){g=(h|0)==45|0;h=c[e>>2]|0;if(h>>>0<(c[f>>2]|0)>>>0){c[e>>2]=h+1;h=d[h]|0}else{h=Gp(a)|0}if((h-48|0)>>>0<10>>>0|(b|0)==0){break}if((c[f>>2]|0)==0){break}c[e>>2]=(c[e>>2]|0)-1}else{g=0}}while(0);if((h-48|0)>>>0>9>>>0){if((c[f>>2]|0)==0){h=-2147483648;i=0;return(L=h,i)|0}c[e>>2]=(c[e>>2]|0)-1;h=-2147483648;i=0;return(L=h,i)|0}else{b=0}while(1){b=h-48+b|0;h=c[e>>2]|0;if(h>>>0<(c[f>>2]|0)>>>0){c[e>>2]=h+1;h=d[h]|0}else{h=Gp(a)|0}if(!((h-48|0)>>>0<10>>>0&(b|0)<214748364)){break}b=b*10|0}i=b;b=(b|0)<0|0?-1:0;if((h-48|0)>>>0<10>>>0){do{b=bq(i,b,10,0)|0;i=L;h=Tp(h,(h|0)<0|0?-1:0,-48,-1)|0;i=Tp(h,L,b,i)|0;b=L;h=c[e>>2]|0;if(h>>>0<(c[f>>2]|0)>>>0){c[e>>2]=h+1;h=d[h]|0}else{h=Gp(a)|0}j=21474836;}while((h-48|0)>>>0<10>>>0&((b|0)<(j|0)|(b|0)==(j|0)&i>>>0<2061584302>>>0))}if((h-48|0)>>>0<10>>>0){do{h=c[e>>2]|0;if(h>>>0<(c[f>>2]|0)>>>0){c[e>>2]=h+1;h=d[h]|0}else{h=Gp(a)|0}}while((h-48|0)>>>0<10>>>0)}if((c[f>>2]|0)!=0){c[e>>2]=(c[e>>2]|0)-1}e=(g|0)!=0;a=Up(0,0,i,b)|0;f=e?L:b;j=e?a:i;return(L=f,j)|0}function Fp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a+104>>2]=b;e=c[a+8>>2]|0;d=c[a+4>>2]|0;f=e-d|0;c[a+108>>2]=f;if((b|0)!=0&(f|0)>(b|0)){c[a+100>>2]=d+b;return}else{c[a+100>>2]=e;return}}function Gp(b){b=b|0;var e=0,f=0,g=0,h=0,i=0;g=b+104|0;e=c[g>>2]|0;if((e|0)==0){f=3}else{if((c[b+108>>2]|0)<(e|0)){f=3}}do{if((f|0)==3){e=Kp(b)|0;if((e|0)<0){break}i=c[g>>2]|0;g=c[b+8>>2]|0;do{if((i|0)==0){f=8}else{h=c[b+4>>2]|0;i=i-(c[b+108>>2]|0)-1|0;if((g-h|0)<=(i|0)){f=8;break}c[b+100>>2]=h+i}}while(0);if((f|0)==8){c[b+100>>2]=g}f=c[b+4>>2]|0;if((g|0)!=0){i=b+108|0;c[i>>2]=g+1-f+(c[i>>2]|0)}b=f-1|0;if((d[b]|0|0)==(e|0)){i=e;return i|0}a[b]=e;i=e;return i|0}}while(0);c[b+100>>2]=0;i=-1;return i|0}function Hp(a,b){a=+a;b=b|0;var d=0;do{if((b|0)>1023){a=a*8.98846567431158e+307;d=b-1023|0;if((d|0)<=1023){b=d;break}b=b-2046|0;a=a*8.98846567431158e+307;b=(b|0)>1023?1023:b}else{if((b|0)>=-1022){break}a=a*2.2250738585072014e-308;d=b+1022|0;if((d|0)>=-1022){b=d;break}b=b+2044|0;a=a*2.2250738585072014e-308;b=(b|0)<-1022?-1022:b}}while(0);return+(a*(c[k>>2]=0<<20|0>>>12,c[k+4>>2]=b+1023<<20|0>>>12,+h[k>>3]))}function Ip(a,b){a=+a;b=b|0;return+(+Hp(a,b))}function Jp(b){b=b|0;var d=0,e=0,f=0;e=b+74|0;d=a[e]|0;a[e]=d-1&255|d;e=b+20|0;d=b+44|0;if((c[e>>2]|0)>>>0>(c[d>>2]|0)>>>0){Cc[c[b+36>>2]&127](b,0,0)|0}c[b+16>>2]=0;c[b+28>>2]=0;c[e>>2]=0;f=b|0;e=c[f>>2]|0;if((e&20|0)==0){f=c[d>>2]|0;c[b+8>>2]=f;c[b+4>>2]=f;f=0;return f|0}if((e&4|0)==0){f=-1;return f|0}c[f>>2]=e|32;f=-1;return f|0}function Kp(a){a=a|0;var b=0,e=0,f=0;b=i;i=i+8|0;f=b|0;if((c[a+8>>2]|0)==0){if((Jp(a)|0)==0){e=3}else{a=-1}}else{e=3}do{if((e|0)==3){if((Cc[c[a+32>>2]&127](a,f,1)|0)!=1){a=-1;break}a=d[f]|0}}while(0);i=b;return a|0}function Lp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0,g=0,h=0;d=i;i=i+112|0;f=d|0;Pp(f|0,0,112)|0;h=f+4|0;c[h>>2]=a;g=f+8|0;c[g>>2]=-1;c[f+44>>2]=a;c[f+76>>2]=-1;Fp(f,0);e=+Dp(f,2,1);f=(c[h>>2]|0)-(c[g>>2]|0)+(c[f+108>>2]|0)|0;if((b|0)==0){i=d;return+e}if((f|0)!=0){a=a+f|0}c[b>>2]=a;i=d;return+e}function Mp(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function Np(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Op(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}b=e}else{Np(b,c,d)|0}return b|0}function Pp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;i=b&3;h=d|d<<8|d<<16|d<<24;g=f&~3;if(i){i=b+4-i|0;while((b|0)<(i|0)){a[b]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function Qp(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){g=d[a+e|0]|0;f=d[b+e|0]|0;if((g|0)!=(f|0))return((g|0)>(f|0)?1:-1)|0;e=e+1|0}return 0}function Rp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;A=A+1|0;c[a>>2]=A;while((e|0)<40){if((c[d+(e<<2)>>2]|0)==0){c[d+(e<<2)>>2]=A;c[d+((e<<2)+4)>>2]=b;c[d+((e<<2)+8)>>2]=0;return 0}e=e+2|0}Cb(116);Cb(111);Cb(111);Cb(32);Cb(109);Cb(97);Cb(110);Cb(121);Cb(32);Cb(115);Cb(101);Cb(116);Cb(106);Cb(109);Cb(112);Cb(115);Cb(32);Cb(105);Cb(110);Cb(32);Cb(97);Cb(32);Cb(102);Cb(117);Cb(110);Cb(99);Cb(116);Cb(105);Cb(111);Cb(110);Cb(32);Cb(99);Cb(97);Cb(108);Cb(108);Cb(44);Cb(32);Cb(98);Cb(117);Cb(105);Cb(108);Cb(100);Cb(32);Cb(119);Cb(105);Cb(116);Cb(104);Cb(32);Cb(97);Cb(32);Cb(104);Cb(105);Cb(103);Cb(104);Cb(101);Cb(114);Cb(32);Cb(118);Cb(97);Cb(108);Cb(117);Cb(101);Cb(32);Cb(102);Cb(111);Cb(114);Cb(32);Cb(77);Cb(65);Cb(88);Cb(95);Cb(83);Cb(69);Cb(84);Cb(74);Cb(77);Cb(80);Cb(83);Cb(10);ia(0);return 0}function Sp(a,b){a=a|0;b=b|0;var d=0,e=0;while((d|0)<20){e=c[b+(d<<2)>>2]|0;if((e|0)==0)break;if((e|0)==(a|0)){return c[b+((d<<2)+4)>>2]|0}d=d+2|0}return 0}function Tp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return(L=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function Up(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b=b-d-(c>>>0>a>>>0|0)>>>0;return(L=b,a-c>>>0|0)|0}function Vp(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){L=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}L=a<<c-32;return 0}function Wp(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){L=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}L=0;return b>>>c-32|0}function Xp(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){L=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}L=(b|0)<0?-1:0;return b>>c-32|0}function Yp(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function Zp(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function _p(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;d=b&65535;c=ha(d,f)|0;e=a>>>16;d=(c>>>16)+(ha(d,e)|0)|0;b=b>>>16;a=ha(b,f)|0;return(L=(d>>>16)+(ha(b,e)|0)+(((d&65535)+a|0)>>>16)|0,d+a<<16|c&65535|0)|0}function $p(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;a=Up(e^a,f^b,e,f)|0;b=L;e=g^e;f=h^f;g=Up((eq(a,b,Up(g^c,h^d,g,h)|0,L,0)|0)^e,L^f,e,f)|0;return(L=L,g)|0}function aq(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;f=g|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=Up(h^a,j^b,h,j)|0;b=L;eq(a,b,Up(k^d,l^e,k,l)|0,L,f)|0;k=Up(c[f>>2]^h,c[f+4>>2]^j,h,j)|0;j=L;i=g;return(L=j,k)|0}function bq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;a=_p(e,f)|0;c=L;return(L=(ha(b,f)|0)+(ha(d,e)|0)+c|c&0,a|0|0)|0}function cq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=eq(a,b,c,d,0)|0;return(L=L,a)|0}function dq(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+8|0;f=g|0;eq(a,b,d,e,f)|0;i=g;return(L=c[f+4>>2]|0,c[f>>2]|0)|0}function eq(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=a;j=b;i=j;k=d;g=e;l=g;if((i|0)==0){d=(f|0)!=0;if((l|0)==0){if(d){c[f>>2]=(h>>>0)%(k>>>0);c[f+4>>2]=0}l=0;m=(h>>>0)/(k>>>0)>>>0;return(L=l,m)|0}else{if(!d){l=0;m=0;return(L=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;l=0;m=0;return(L=l,m)|0}}m=(l|0)==0;do{if((k|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(k>>>0);c[f+4>>2]=0}l=0;m=(i>>>0)/(k>>>0)>>>0;return(L=l,m)|0}if((h|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}k=0;m=(i>>>0)/(l>>>0)>>>0;return(L=k,m)|0}k=l-1|0;if((k&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=k&i|b&0}k=0;m=i>>>((Zp(l|0)|0)>>>0);return(L=k,m)|0}k=(Yp(l|0)|0)-(Yp(i|0)|0)|0;if(k>>>0<=30){b=k+1|0;m=31-k|0;j=b;a=i<<m|h>>>(b>>>0);b=i>>>(b>>>0);l=0;i=h<<m;break}if((f|0)==0){l=0;m=0;return(L=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;l=0;m=0;return(L=l,m)|0}else{if(!m){k=(Yp(l|0)|0)-(Yp(i|0)|0)|0;if(k>>>0<=31){l=k+1|0;m=31-k|0;b=k-31>>31;j=l;a=h>>>(l>>>0)&b|i<<m;b=i>>>(l>>>0)&b;l=0;i=h<<m;break}if((f|0)==0){l=0;m=0;return(L=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;l=0;m=0;return(L=l,m)|0}l=k-1|0;if((l&k|0)!=0){m=(Yp(k|0)|0)+33-(Yp(i|0)|0)|0;p=64-m|0;k=32-m|0;n=k>>31;o=m-32|0;b=o>>31;j=m;a=k-1>>31&i>>>(o>>>0)|(i<<k|h>>>(m>>>0))&b;b=b&i>>>(m>>>0);l=h<<p&n;i=(i<<p|h>>>(o>>>0))&n|h<<k&m-33>>31;break}if((f|0)!=0){c[f>>2]=l&h;c[f+4>>2]=0}if((k|0)==1){o=j|b&0;p=a|0|0;return(L=o,p)|0}else{p=Zp(k|0)|0;o=i>>>(p>>>0)|0;p=i<<32-p|h>>>(p>>>0)|0;return(L=o,p)|0}}}while(0);if((j|0)==0){m=a;d=0;a=0}else{d=d|0|0;g=g|e&0;e=Tp(d,g,-1,-1)|0;h=L;k=b;m=a;a=0;while(1){b=l>>>31|i<<1;l=a|l<<1;i=m<<1|i>>>31|0;k=m>>>31|k<<1|0;Up(e,h,i,k)|0;m=L;p=m>>31|((m|0)<0?-1:0)<<1;a=p&1;m=Up(i,k,p&d,(((m|0)<0?-1:0)>>31|((m|0)<0?-1:0)<<1)&g)|0;k=L;j=j-1|0;if((j|0)==0){break}else{i=b}}i=b;b=k;d=0}g=0;if((f|0)!=0){c[f>>2]=m;c[f+4>>2]=b}o=(l|0)>>>31|(i|g)<<1|(g<<1|l>>>31)&0|d;p=(l<<1|0>>>31)&-2|a;return(L=o,p)|0}function fq(a){a=a|0;rb(a|0)}function gq(a){a=a|0;return Pa(a|0)|0}function hq(a){a=a|0;return _b(a|0)|0}function iq(a){a=a|0;return Rb(a|0)|0}function jq(a){a=a|0;return Qb(a|0)|0}function kq(a){a=a|0;return Ob(a|0)|0}function lq(a,b,c){a=a|0;b=b|0;c=c|0;return _a(a|0,b|0,c|0)|0}function mq(a,b,c){a=a|0;b=b|0;c=c|0;return nc(a|0,b|0,c|0)|0}function nq(a,b){a=a|0;b=b|0;return fc(a|0,b|0)|0}function oq(a,b){a=a|0;b=b|0;return nb(a|0,b|0)|0}function pq(){return qc()|0}function qq(){return qb()|0}function rq(){return pc()|0}function sq(a,b,c){a=a|0;b=b|0;c=c|0;Hb(a|0,b|0,c|0)}function tq(){bb()}function uq(){Qa()}function vq(){dc()}function wq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return gb(a|0,b|0,c|0,d|0)|0}function xq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return sb(a|0,b|0,c|0,d|0)|0}function yq(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;return wc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0)|0}function zq(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;xc[a&15](b|0,c|0,d|0,e|0,f|0)}function Aq(a,b){a=a|0;b=b|0;yc[a&511](b|0)}function Bq(a,b,c){a=a|0;b=b|0;c=c|0;zc[a&127](b|0,c|0)}function Cq(a,b){a=a|0;b=b|0;return Ac[a&255](b|0)|0}function Dq(a,b,c,d,e,f,g,h,i,j,k,l){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;return Bc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0,k|0,l|0)|0}function Eq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Cc[a&127](b|0,c|0,d|0)|0}function Fq(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;Dc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0,k|0,l|0,m|0,n|0,o|0,p|0)}function Gq(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;Ec[a&15](b|0,c|0,d|0,e|0,f|0,+g)}function Hq(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;Fc[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)}function Iq(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;Gc[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function Jq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return+Hc[a&3](b|0,c|0,d|0)}function Kq(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;Ic[a&127](b|0,c|0,d|0,e|0,f|0,g|0,h|0)}function Lq(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;Jc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,+h)}function Mq(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;Kc[a&7](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0)}function Nq(a,b,c,d,e,f,g,h,i,j,k){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;Lc[a&15](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0,j|0,k|0)}function Oq(a,b,c){a=a|0;b=b|0;c=c|0;return Mc[a&63](b|0,c|0)|0}function Pq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return+Nc[a&7](b|0,c|0,d|0)}function Qq(a){a=a|0;return Oc[a&15]()|0}function Rq(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return Pc[a&31](b|0,c|0,d|0,e|0,f|0)|0}function Sq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Qc[a&31](b|0,c|0,d|0)}function Tq(a){a=a|0;Rc[a&15]()}function Uq(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return Sc[a&31](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function Vq(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Tc[a&63](b|0,c|0,d|0,e|0)|0}function Wq(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Uc[a&31](b|0,c|0,d|0,e|0)}function Xq(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ia(0);return 0}function Yq(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ia(1)}function Zq(a){a=a|0;ia(2)}function _q(a,b){a=a|0;b=b|0;ia(3)}function $q(a){a=a|0;ia(4);return 0}function ar(a,b,c,d,e,f,g,h,i,j,k){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;ia(5);return 0}function br(a,b,c){a=a|0;b=b|0;c=c|0;ia(6);return 0}function cr(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;ia(7)}function dr(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;ia(8)}function er(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ia(9)}function fr(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ia(10)}function gr(a,b,c){a=a|0;b=b|0;c=c|0;ia(11);return 0.0}function hr(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;ia(12)}function ir(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=+g;ia(13)}function jr(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;ia(14)}function kr(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;ia(15)}function lr(a,b){a=a|0;b=b|0;ia(16);return 0}function mr(a,b,c){a=a|0;b=b|0;c=c|0;ia(17);return 0.0}function nr(){ia(18);return 0}function or(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ia(19);return 0}function pr(a,b,c){a=a|0;b=b|0;c=c|0;ia(20)}function qr(){ia(21)}function rr(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ia(22);return 0}function sr(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ia(23);return 0}function tr(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ia(24)}



function sk(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+328|0;Z=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[Z>>2];Z=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[Z>>2];Z=l|0;B=l+8|0;z=l+16|0;N=l+24|0;K=l+32|0;w=l+40|0;x=l+48|0;t=l+56|0;T=l+64|0;s=l+72|0;G=l+80|0;F=l+88|0;$=l+96|0;R=l+112|0;r=l+120|0;q=l+128|0;p=l+136|0;J=l+144|0;H=l+152|0;I=l+160|0;E=l+168|0;C=l+176|0;D=l+184|0;A=l+192|0;X=l+200|0;u=l+208|0;W=l+216|0;V=l+224|0;O=l+232|0;Q=l+240|0;P=l+248|0;S=l+256|0;U=l+264|0;v=l+272|0;L=l+280|0;M=l+288|0;o=l+296|0;n=l+304|0;m=l+312|0;Y=l+320|0;c[h>>2]=0;sh(R,g);R=R|0;_=c[R>>2]|0;do{if((c[7716]|0)!=-1){c[$>>2]=30864;c[$+4>>2]=18;c[$+8>>2]=0;y=0;Ha(4,30864,$|0,114);if(!y){break}else{y=0}aa=Mb(-1,-1)|0;$=c[R>>2]|0;$=$|0;xg($)|0;db(aa|0)}}while(0);$=(c[7717]|0)-1|0;aa=c[_+8>>2]|0;do{if((c[_+12>>2]|0)-aa>>2>>>0>$>>>0){_=c[aa+($<<2)>>2]|0;if((_|0)==0){break}xg(c[R>>2]|0)|0;a:do{switch(k<<24>>24|0){case 72:{c[T>>2]=c[f>>2];g=wk(e,T,h,_,2)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<24){c[j+8>>2]=g;break a}else{c[h>>2]=d|4;break a}break};case 89:{c[Z>>2]=c[f>>2];d=wk(e,Z,h,_,4)|0;if((c[h>>2]&4|0)!=0){break a}c[j+20>>2]=d-1900;break};case 37:{c[Y>>2]=c[f>>2];vk(0,e,Y,h,_);break};case 112:{c[X>>2]=c[f>>2];uk(d,j+8|0,e,X,h,_);break};case 114:{aa=e|0;c[W>>2]=c[aa>>2];c[V>>2]=c[f>>2];jk(u,d,W,V,g,h,j,19472,19483);c[aa>>2]=c[u>>2];break};case 82:{aa=e|0;c[Q>>2]=c[aa>>2];c[P>>2]=c[f>>2];jk(O,d,Q,P,g,h,j,19464,19469);c[aa>>2]=c[O>>2];break};case 83:{c[N>>2]=c[f>>2];d=wk(e,N,h,_,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<61){c[j>>2]=d;break a}else{c[h>>2]=g|4;break a}break};case 110:case 116:{c[A>>2]=c[f>>2];tk(0,e,A,h,_);break};case 119:{c[z>>2]=c[f>>2];g=wk(e,z,h,_,1)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<7){c[j+24>>2]=g;break a}else{c[h>>2]=d|4;break a}break};case 106:{c[x>>2]=c[f>>2];g=wk(e,x,h,_,3)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<366){c[j+28>>2]=g;break a}else{c[h>>2]=d|4;break a}break};case 84:{aa=e|0;c[U>>2]=c[aa>>2];c[v>>2]=c[f>>2];jk(S,d,U,v,g,h,j,19456,19464);c[aa>>2]=c[S>>2];break};case 73:{j=j+8|0;c[t>>2]=c[f>>2];d=wk(e,t,h,_,2)|0;g=c[h>>2]|0;do{if((g&4|0)==0){if((d-1|0)>>>0>=12>>>0){break}c[j>>2]=d;break a}}while(0);c[h>>2]=g|4;break};case 109:{c[w>>2]=c[f>>2];d=wk(e,w,h,_,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<13){c[j+16>>2]=d-1;break a}else{c[h>>2]=g|4;break a}break};case 99:{o=d+8|0;o=Ac[c[(c[o>>2]|0)+12>>2]&255](o)|0;m=e|0;c[q>>2]=c[m>>2];c[p>>2]=c[f>>2];f=o;k=a[o]|0;if((k&1)==0){n=f+1|0;f=f+1|0}else{f=c[o+8>>2]|0;n=f}k=k&255;if((k&1|0)==0){o=k>>>1}else{o=c[o+4>>2]|0}jk(r,d,q,p,g,h,j,f,n+o|0);c[m>>2]=c[r>>2];break};case 121:{c[B>>2]=c[f>>2];d=wk(e,B,h,_,4)|0;if((c[h>>2]&4|0)!=0){break a}if((d|0)<69){h=d+2e3|0}else{h=(d-69|0)>>>0<31>>>0?d+1900|0:d}c[j+20>>2]=h-1900;break};case 70:{aa=e|0;c[C>>2]=c[aa>>2];c[D>>2]=c[f>>2];jk(E,d,C,D,g,h,j,19488,19496);c[aa>>2]=c[E>>2];break};case 97:case 65:{$=c[f>>2]|0;aa=d+8|0;aa=Ac[c[c[aa>>2]>>2]&255](aa)|0;c[F>>2]=$;h=(Mi(e,F,aa,aa+168|0,_,h,0)|0)-aa|0;if((h|0)>=168){break a}c[j+24>>2]=((h|0)/12|0|0)%7|0;break};case 98:case 66:case 104:{$=c[f>>2]|0;aa=d+8|0;aa=Ac[c[(c[aa>>2]|0)+4>>2]&255](aa)|0;c[G>>2]=$;h=(Mi(e,G,aa,aa+288|0,_,h,0)|0)-aa|0;if((h|0)>=288){break a}c[j+16>>2]=((h|0)/12|0|0)%12|0;break};case 68:{aa=e|0;c[H>>2]=c[aa>>2];c[I>>2]=c[f>>2];jk(J,d,H,I,g,h,j,19496,19504);c[aa>>2]=c[J>>2];break};case 77:{c[K>>2]=c[f>>2];d=wk(e,K,h,_,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<60){c[j+4>>2]=d;break a}else{c[h>>2]=g|4;break a}break};case 120:{aa=c[(c[d>>2]|0)+20>>2]|0;c[L>>2]=c[e>>2];c[M>>2]=c[f>>2];Ic[aa&127](b,d,L,M,g,h,j);i=l;return};case 88:{q=d+8|0;q=Ac[c[(c[q>>2]|0)+24>>2]&255](q)|0;p=e|0;c[n>>2]=c[p>>2];c[m>>2]=c[f>>2];f=q;k=a[q]|0;if((k&1)==0){r=f+1|0;f=f+1|0}else{f=c[q+8>>2]|0;r=f}k=k&255;if((k&1|0)==0){q=k>>>1}else{q=c[q+4>>2]|0}jk(o,d,n,m,g,h,j,f,r+q|0);c[p>>2]=c[o>>2];break};case 100:case 101:{j=j+12|0;c[s>>2]=c[f>>2];g=wk(e,s,h,_,2)|0;d=c[h>>2]|0;do{if((d&4|0)==0){if((g-1|0)>>>0>=31>>>0){break}c[j>>2]=g;break a}}while(0);c[h>>2]=d|4;break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);aa=lc(4)|0;Xo(aa);y=0;Ha(16,aa|0,25592,150);if(y){y=0;aa=Mb(-1,-1)|0;$=c[R>>2]|0;$=$|0;xg($)|0;db(aa|0)}}function tk(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;d=i;n=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[n>>2];e=e|0;f=f|0;h=h+8|0;a:while(1){k=c[e>>2]|0;do{if((k|0)==0){k=0}else{if((c[k+12>>2]|0)!=(c[k+16>>2]|0)){break}if((Ac[c[(c[k>>2]|0)+36>>2]&255](k)|0)==-1){c[e>>2]=0;k=0;break}else{k=c[e>>2]|0;break}}}while(0);k=(k|0)==0;l=c[f>>2]|0;b:do{if((l|0)==0){j=12}else{do{if((c[l+12>>2]|0)==(c[l+16>>2]|0)){if((Ac[c[(c[l>>2]|0)+36>>2]&255](l)|0)!=-1){break}c[f>>2]=0;j=12;break b}}while(0);if(k){k=0}else{k=0;break a}}}while(0);if((j|0)==12){j=0;if(k){l=0;k=1;break}else{l=0;k=1}}n=c[e>>2]|0;m=c[n+12>>2]|0;if((m|0)==(c[n+16>>2]|0)){m=(Ac[c[(c[n>>2]|0)+36>>2]&255](n)|0)&255}else{m=a[m]|0}if(m<<24>>24<=-1){break}if((b[(c[h>>2]|0)+(m<<24>>24<<1)>>1]&8192)==0){break}k=c[e>>2]|0;l=k+12|0;m=c[l>>2]|0;if((m|0)==(c[k+16>>2]|0)){Ac[c[(c[k>>2]|0)+40>>2]&255](k)|0;continue}else{c[l>>2]=m+1;continue}}h=c[e>>2]|0;do{if((h|0)==0){h=0}else{if((c[h+12>>2]|0)!=(c[h+16>>2]|0)){break}if((Ac[c[(c[h>>2]|0)+36>>2]&255](h)|0)==-1){c[e>>2]=0;h=0;break}else{h=c[e>>2]|0;break}}}while(0);e=(h|0)==0;do{if(k){j=31}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){if(!(e^(l|0)==0)){break}i=d;return}if((Ac[c[(c[l>>2]|0)+36>>2]&255](l)|0)==-1){c[f>>2]=0;j=31;break}if(!e){break}i=d;return}}while(0);do{if((j|0)==31){if(e){break}i=d;return}}while(0);c[g>>2]=c[g>>2]|2;i=d;return}function uk(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[k>>2];k=j|0;a=a+8|0;a=Ac[c[(c[a>>2]|0)+8>>2]&255](a)|0;l=d[a]|0;if((l&1|0)==0){l=l>>>1}else{l=c[a+4>>2]|0}m=d[a+12|0]|0;if((m&1|0)==0){m=m>>>1}else{m=c[a+16>>2]|0}if((l|0)==(-m|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];m=Mi(e,k,a,a+24|0,h,g,0)|0;h=m-a|0;do{if((m|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((h|0)!=12){i=j;return}h=c[b>>2]|0;if((h|0)>=12){i=j;return}c[b>>2]=h+12;i=j;return}function vk(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;b=i;j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];d=d|0;j=c[d>>2]|0;do{if((j|0)==0){j=0}else{if((c[j+12>>2]|0)!=(c[j+16>>2]|0)){break}if((Ac[c[(c[j>>2]|0)+36>>2]&255](j)|0)==-1){c[d>>2]=0;j=0;break}else{j=c[d>>2]|0;break}}}while(0);j=(j|0)==0;e=e|0;k=c[e>>2]|0;a:do{if((k|0)==0){h=11}else{do{if((c[k+12>>2]|0)==(c[k+16>>2]|0)){if((Ac[c[(c[k>>2]|0)+36>>2]&255](k)|0)!=-1){break}c[e>>2]=0;h=11;break a}}while(0);if(j){j=0}else{h=12}}}while(0);if((h|0)==11){if(j){h=12}else{k=0;j=1}}if((h|0)==12){c[f>>2]=c[f>>2]|6;i=b;return}l=c[d>>2]|0;m=c[l+12>>2]|0;if((m|0)==(c[l+16>>2]|0)){l=(Ac[c[(c[l>>2]|0)+36>>2]&255](l)|0)&255}else{l=a[m]|0}if((Cc[c[(c[g>>2]|0)+36>>2]&127](g,l,0)|0)<<24>>24!=37){c[f>>2]=c[f>>2]|4;i=b;return}g=c[d>>2]|0;l=g+12|0;m=c[l>>2]|0;if((m|0)==(c[g+16>>2]|0)){Ac[c[(c[g>>2]|0)+40>>2]&255](g)|0}else{c[l>>2]=m+1}g=c[d>>2]|0;do{if((g|0)==0){g=0}else{if((c[g+12>>2]|0)!=(c[g+16>>2]|0)){break}if((Ac[c[(c[g>>2]|0)+36>>2]&255](g)|0)==-1){c[d>>2]=0;g=0;break}else{g=c[d>>2]|0;break}}}while(0);d=(g|0)==0;do{if(j){h=31}else{if((c[k+12>>2]|0)!=(c[k+16>>2]|0)){if(!(d^(k|0)==0)){break}i=b;return}if((Ac[c[(c[k>>2]|0)+36>>2]&255](k)|0)==-1){c[e>>2]=0;h=31;break}if(!d){break}i=b;return}}while(0);do{if((h|0)==31){if(d){break}i=b;return}}while(0);c[f>>2]=c[f>>2]|2;i=b;return}function wk(d,e,f,g,h){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;l=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];d=d|0;l=c[d>>2]|0;do{if((l|0)==0){l=0}else{if((c[l+12>>2]|0)!=(c[l+16>>2]|0)){break}if((Ac[c[(c[l>>2]|0)+36>>2]&255](l)|0)==-1){c[d>>2]=0;l=0;break}else{l=c[d>>2]|0;break}}}while(0);l=(l|0)==0;e=e|0;m=c[e>>2]|0;a:do{if((m|0)==0){k=11}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((Ac[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){break}c[e>>2]=0;k=11;break a}}while(0);if(!l){k=12}}}while(0);if((k|0)==11){if(l){k=12}else{m=0}}if((k|0)==12){c[f>>2]=c[f>>2]|6;q=0;i=j;return q|0}k=c[d>>2]|0;l=c[k+12>>2]|0;if((l|0)==(c[k+16>>2]|0)){n=(Ac[c[(c[k>>2]|0)+36>>2]&255](k)|0)&255}else{n=a[l]|0}do{if(n<<24>>24>-1){l=g+8|0;if((b[(c[l>>2]|0)+(n<<24>>24<<1)>>1]&2048)==0){break}k=g;n=(Cc[c[(c[k>>2]|0)+36>>2]&127](g,n,0)|0)<<24>>24;o=c[d>>2]|0;p=o+12|0;q=c[p>>2]|0;if((q|0)==(c[o+16>>2]|0)){Ac[c[(c[o>>2]|0)+40>>2]&255](o)|0}else{c[p>>2]=q+1}while(1){n=n-48|0;h=h-1|0;p=c[d>>2]|0;do{if((p|0)==0){p=0}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){break}if((Ac[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[d>>2]=0;p=0;break}else{p=c[d>>2]|0;break}}}while(0);o=(p|0)==0;if((m|0)==0){m=0}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((Ac[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){break}c[e>>2]=0;m=0}}while(0);p=c[d>>2]|0}q=(m|0)==0;if(!((o^q)&(h|0)>0)){k=41;break}o=c[p+12>>2]|0;if((o|0)==(c[p+16>>2]|0)){o=(Ac[c[(c[p>>2]|0)+36>>2]&255](p)|0)&255}else{o=a[o]|0}if(o<<24>>24<=-1){k=53;break}if((b[(c[l>>2]|0)+(o<<24>>24<<1)>>1]&2048)==0){k=53;break}n=((Cc[c[(c[k>>2]|0)+36>>2]&127](g,o,0)|0)<<24>>24)+(n*10|0)|0;o=c[d>>2]|0;q=o+12|0;p=c[q>>2]|0;if((p|0)==(c[o+16>>2]|0)){Ac[c[(c[o>>2]|0)+40>>2]&255](o)|0;continue}else{c[q>>2]=p+1;continue}}if((k|0)==41){do{if((p|0)==0){p=0}else{if((c[p+12>>2]|0)!=(c[p+16>>2]|0)){break}if((Ac[c[(c[p>>2]|0)+36>>2]&255](p)|0)==-1){c[d>>2]=0;p=0;break}else{p=c[d>>2]|0;break}}}while(0);g=(p|0)==0;b:do{if(q){k=51}else{do{if((c[m+12>>2]|0)==(c[m+16>>2]|0)){if((Ac[c[(c[m>>2]|0)+36>>2]&255](m)|0)!=-1){break}c[e>>2]=0;k=51;break b}}while(0);if(!g){break}i=j;return n|0}}while(0);do{if((k|0)==51){if(g){break}i=j;return n|0}}while(0);c[f>>2]=c[f>>2]|2;q=n;i=j;return q|0}else if((k|0)==53){i=j;return n|0}}}while(0);c[f>>2]=c[f>>2]|4;q=0;i=j;return q|0}function xk(a,b,d,e,f,g,h,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;l=i;i=i+48|0;s=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[s>>2];s=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[s>>2];s=l|0;r=l+16|0;n=l+24|0;p=l+32|0;o=l+40|0;sh(r,f);r=r|0;q=c[r>>2]|0;do{if((c[7714]|0)!=-1){c[s>>2]=30856;c[s+4>>2]=18;c[s+8>>2]=0;y=0;Ha(4,30856,s|0,114);if(!y){break}else{y=0}F=Mb(-1,-1)|0;E=c[r>>2]|0;E=E|0;xg(E)|0;db(F|0)}}while(0);t=(c[7715]|0)-1|0;s=c[q+8>>2]|0;do{if((c[q+12>>2]|0)-s>>2>>>0>t>>>0){v=c[s+(t<<2)>>2]|0;if((v|0)==0){break}q=v;xg(c[r>>2]|0)|0;c[g>>2]=0;t=d|0;a:do{if((j|0)==(k|0)){m=71}else{u=e|0;r=v;s=v;z=v;x=b;A=p|0;w=o|0;v=n|0;B=0;b:while(1){while(1){if((B|0)!=0){m=71;break a}B=c[t>>2]|0;do{if((B|0)==0){B=0}else{C=c[B+12>>2]|0;if((C|0)==(c[B+16>>2]|0)){C=Ac[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{C=c[C>>2]|0}if((C|0)!=-1){break}c[t>>2]=0;B=0}}while(0);D=(B|0)==0;C=c[u>>2]|0;do{if((C|0)==0){m=23}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){E=Ac[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{E=c[E>>2]|0}if((E|0)==-1){c[u>>2]=0;m=23;break}else{if(D^(C|0)==0){break}else{m=25;break b}}}}while(0);if((m|0)==23){m=0;if(D){m=25;break b}else{C=0}}if((Cc[c[(c[r>>2]|0)+52>>2]&127](q,c[j>>2]|0,0)|0)<<24>>24==37){m=28;break}if(Cc[c[(c[s>>2]|0)+12>>2]&127](q,8192,c[j>>2]|0)|0){m=38;break}C=B+12|0;E=c[C>>2]|0;D=B+16|0;if((E|0)==(c[D>>2]|0)){E=Ac[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{E=c[E>>2]|0}F=Mc[c[(c[z>>2]|0)+28>>2]&63](q,E)|0;if((F|0)==(Mc[c[(c[z>>2]|0)+28>>2]&63](q,c[j>>2]|0)|0)){m=66;break}c[g>>2]=4;B=4}c:do{if((m|0)==28){m=0;E=j+4|0;if((E|0)==(k|0)){m=29;break b}D=Cc[c[(c[r>>2]|0)+52>>2]&127](q,c[E>>2]|0,0)|0;if((D<<24>>24|0)==69|(D<<24>>24|0)==48){E=j+8|0;if((E|0)==(k|0)){m=32;break b}j=D;D=Cc[c[(c[r>>2]|0)+52>>2]&127](q,c[E>>2]|0,0)|0}else{j=0}F=c[(c[x>>2]|0)+36>>2]|0;c[A>>2]=B;c[w>>2]=C;Kc[F&7](n,b,p,o,f,g,h,D,j);c[t>>2]=c[v>>2];j=E+4|0}else if((m|0)==38){while(1){m=0;j=j+4|0;if((j|0)==(k|0)){j=k;break}if(Cc[c[(c[s>>2]|0)+12>>2]&127](q,8192,c[j>>2]|0)|0){m=38}else{break}}while(1){do{if((B|0)==0){B=0}else{D=c[B+12>>2]|0;if((D|0)==(c[B+16>>2]|0)){D=Ac[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{D=c[D>>2]|0}if((D|0)!=-1){break}c[t>>2]=0;B=0}}while(0);D=(B|0)==0;do{if((C|0)==0){m=53}else{E=c[C+12>>2]|0;if((E|0)==(c[C+16>>2]|0)){E=Ac[c[(c[C>>2]|0)+36>>2]&255](C)|0}else{E=c[E>>2]|0}if((E|0)==-1){c[u>>2]=0;m=53;break}else{if(D^(C|0)==0){break}else{break c}}}}while(0);if((m|0)==53){m=0;if(D){break c}else{C=0}}D=B+12|0;F=c[D>>2]|0;E=B+16|0;if((F|0)==(c[E>>2]|0)){F=Ac[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{F=c[F>>2]|0}if(!(Cc[c[(c[s>>2]|0)+12>>2]&127](q,8192,F)|0)){break c}F=c[D>>2]|0;if((F|0)==(c[E>>2]|0)){Ac[c[(c[B>>2]|0)+40>>2]&255](B)|0;continue}else{c[D>>2]=F+4;continue}}}else if((m|0)==66){m=0;E=c[C>>2]|0;if((E|0)==(c[D>>2]|0)){Ac[c[(c[B>>2]|0)+40>>2]&255](B)|0}else{c[C>>2]=E+4}j=j+4|0}}while(0);if((j|0)==(k|0)){m=71;break a}B=c[g>>2]|0}if((m|0)==25){c[g>>2]=4;break}else if((m|0)==29){c[g>>2]=4;break}else if((m|0)==32){c[g>>2]=4;break}}}while(0);if((m|0)==71){B=c[t>>2]|0}d=d|0;do{if((B|0)!=0){k=c[B+12>>2]|0;if((k|0)==(c[B+16>>2]|0)){k=Ac[c[(c[B>>2]|0)+36>>2]&255](B)|0}else{k=c[k>>2]|0}if((k|0)!=-1){break}c[d>>2]=0}}while(0);k=c[d>>2]|0;d=(k|0)==0;e=e|0;b=c[e>>2]|0;do{if((b|0)==0){m=84}else{f=c[b+12>>2]|0;if((f|0)==(c[b+16>>2]|0)){f=Ac[c[(c[b>>2]|0)+36>>2]&255](b)|0}else{f=c[f>>2]|0}if((f|0)==-1){c[e>>2]=0;m=84;break}if(!(d^(b|0)==0)){break}F=a|0;c[F>>2]=k;i=l;return}}while(0);do{if((m|0)==84){if(d){break}F=a|0;c[F>>2]=k;i=l;return}}while(0);c[g>>2]=c[g>>2]|2;F=a|0;c[F>>2]=k;i=l;return}}while(0);F=lc(4)|0;Xo(F);y=0;Ha(16,F|0,25592,150);if(y){y=0;F=Mb(-1,-1)|0;E=c[r>>2]|0;E=E|0;xg(E)|0;db(F|0)}}function yk(a){a=a|0;vg(a|0);xp(a);return}function zk(a){a=a|0;vg(a|0);return}function Ak(a){a=a|0;return 2}function Bk(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+16|0;m=d;l=i;i=i+4|0;i=i+7&-8;c[l>>2]=c[m>>2];m=e;k=i;i=i+4|0;i=i+7&-8;c[k>>2]=c[m>>2];e=j|0;d=j+8|0;c[e>>2]=c[l>>2];c[d>>2]=c[k>>2];xk(a,b,e,d,f,g,h,19424,19456);i=j;return}function Ck(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0;k=i;i=i+16|0;n=e;m=i;i=i+4|0;i=i+7&-8;c[m>>2]=c[n>>2];n=f;o=i;i=i+4|0;i=i+7&-8;c[o>>2]=c[n>>2];f=k|0;e=k+8|0;n=d+8|0;n=Ac[c[(c[n>>2]|0)+20>>2]&255](n)|0;c[f>>2]=c[m>>2];c[e>>2]=c[o>>2];o=a[n]|0;if((o&1)==0){m=n+4|0;l=n+4|0}else{l=c[n+8>>2]|0;m=l}o=o&255;if((o&1|0)==0){n=o>>>1}else{n=c[n+4>>2]|0}xk(b,d,f,e,g,h,j,l,m+(n<<2)|0);i=k;return}function Dk(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;m=j+8|0;l=j+24|0;sh(l,f);f=l|0;l=c[f>>2]|0;do{if((c[7714]|0)!=-1){c[m>>2]=30856;c[m+4>>2]=18;c[m+8>>2]=0;y=0;Ha(4,30856,m|0,114);if(!y){break}else{y=0}n=Mb(-1,-1)|0;m=c[f>>2]|0;m=m|0;xg(m)|0;db(n|0)}}while(0);m=(c[7715]|0)-1|0;n=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-n>>2>>>0>m>>>0){l=c[n+(m<<2)>>2]|0;if((l|0)==0){break}xg(c[f>>2]|0)|0;n=c[e>>2]|0;e=b+8|0;e=Ac[c[c[e>>2]>>2]&255](e)|0;c[k>>2]=n;e=(jj(d,k,e,e+168|0,l,g,0)|0)-e|0;if((e|0)>=168){m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=j;return}c[h+24>>2]=((e|0)/12|0|0)%7|0;m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=j;return}}while(0);n=lc(4)|0;Xo(n);y=0;Ha(16,n|0,25592,150);if(y){y=0;n=Mb(-1,-1)|0;m=c[f>>2]|0;m=m|0;xg(m)|0;db(n|0)}}function Ek(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0;j=i;i=i+32|0;k=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[k>>2];k=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[k>>2];k=j|0;m=j+8|0;l=j+24|0;sh(l,f);f=l|0;l=c[f>>2]|0;do{if((c[7714]|0)!=-1){c[m>>2]=30856;c[m+4>>2]=18;c[m+8>>2]=0;y=0;Ha(4,30856,m|0,114);if(!y){break}else{y=0}n=Mb(-1,-1)|0;m=c[f>>2]|0;m=m|0;xg(m)|0;db(n|0)}}while(0);m=(c[7715]|0)-1|0;n=c[l+8>>2]|0;do{if((c[l+12>>2]|0)-n>>2>>>0>m>>>0){l=c[n+(m<<2)>>2]|0;if((l|0)==0){break}xg(c[f>>2]|0)|0;n=c[e>>2]|0;e=b+8|0;e=Ac[c[(c[e>>2]|0)+4>>2]&255](e)|0;c[k>>2]=n;e=(jj(d,k,e,e+288|0,l,g,0)|0)-e|0;if((e|0)>=288){m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=j;return}c[h+16>>2]=((e|0)/12|0|0)%12|0;m=d|0;m=c[m>>2]|0;n=a|0;c[n>>2]=m;i=j;return}}while(0);n=lc(4)|0;Xo(n);y=0;Ha(16,n|0,25592,150);if(y){y=0;n=Mb(-1,-1)|0;m=c[f>>2]|0;m=m|0;xg(m)|0;db(n|0)}}function Fk(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;b=i;i=i+32|0;j=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[j>>2];j=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[j>>2];j=b|0;l=b+8|0;k=b+24|0;sh(k,f);f=k|0;k=c[f>>2]|0;do{if((c[7714]|0)!=-1){c[l>>2]=30856;c[l+4>>2]=18;c[l+8>>2]=0;y=0;Ha(4,30856,l|0,114);if(!y){break}else{y=0}m=Mb(-1,-1)|0;l=c[f>>2]|0;l=l|0;xg(l)|0;db(m|0)}}while(0);m=(c[7715]|0)-1|0;l=c[k+8>>2]|0;do{if((c[k+12>>2]|0)-l>>2>>>0>m>>>0){k=c[l+(m<<2)>>2]|0;if((k|0)==0){break}xg(c[f>>2]|0)|0;c[j>>2]=c[e>>2];e=Kk(d,j,g,k,4)|0;if((c[g>>2]&4|0)!=0){l=d|0;l=c[l>>2]|0;m=a|0;c[m>>2]=l;i=b;return}if((e|0)<69){g=e+2e3|0}else{g=(e-69|0)>>>0<31>>>0?e+1900|0:e}c[h+20>>2]=g-1900;l=d|0;l=c[l>>2]|0;m=a|0;c[m>>2]=l;i=b;return}}while(0);m=lc(4)|0;Xo(m);y=0;Ha(16,m|0,25592,150);if(y){y=0;m=Mb(-1,-1)|0;l=c[f>>2]|0;l=l|0;xg(l)|0;db(m|0)}}function Gk(b,d,e,f,g,h,j,k,l){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;l=i;i=i+328|0;x=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[x>>2];x=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[x>>2];x=l|0;R=l+8|0;u=l+16|0;L=l+24|0;v=l+32|0;M=l+40|0;w=l+48|0;s=l+56|0;T=l+64|0;t=l+72|0;N=l+80|0;Y=l+88|0;$=l+96|0;S=l+112|0;n=l+120|0;o=l+128|0;p=l+136|0;C=l+144|0;A=l+152|0;B=l+160|0;Q=l+168|0;O=l+176|0;P=l+184|0;D=l+192|0;E=l+200|0;H=l+208|0;F=l+216|0;G=l+224|0;K=l+232|0;I=l+240|0;J=l+248|0;Z=l+256|0;U=l+264|0;V=l+272|0;X=l+280|0;W=l+288|0;r=l+296|0;m=l+304|0;q=l+312|0;z=l+320|0;c[h>>2]=0;sh(S,g);S=S|0;_=c[S>>2]|0;do{if((c[7714]|0)!=-1){c[$>>2]=30856;c[$+4>>2]=18;c[$+8>>2]=0;y=0;Ha(4,30856,$|0,114);if(!y){break}else{y=0}aa=Mb(-1,-1)|0;$=c[S>>2]|0;$=$|0;xg($)|0;db(aa|0)}}while(0);aa=(c[7715]|0)-1|0;$=c[_+8>>2]|0;do{if((c[_+12>>2]|0)-$>>2>>>0>aa>>>0){_=c[$+(aa<<2)>>2]|0;if((_|0)==0){break}xg(c[S>>2]|0)|0;a:do{switch(k<<24>>24|0){case 98:case 66:case 104:{$=c[f>>2]|0;aa=d+8|0;aa=Ac[c[(c[aa>>2]|0)+4>>2]&255](aa)|0;c[N>>2]=$;h=(jj(e,N,aa,aa+288|0,_,h,0)|0)-aa|0;if((h|0)>=288){break a}c[j+16>>2]=((h|0)/12|0|0)%12|0;break};case 97:case 65:{$=c[f>>2]|0;aa=d+8|0;aa=Ac[c[c[aa>>2]>>2]&255](aa)|0;c[Y>>2]=$;h=(jj(e,Y,aa,aa+168|0,_,h,0)|0)-aa|0;if((h|0)>=168){break a}c[j+24>>2]=((h|0)/12|0|0)%7|0;break};case 120:{aa=c[(c[d>>2]|0)+20>>2]|0;c[X>>2]=c[e>>2];c[W>>2]=c[f>>2];Ic[aa&127](b,d,X,W,g,h,j);i=l;return};case 88:{s=d+8|0;s=Ac[c[(c[s>>2]|0)+24>>2]&255](s)|0;n=e|0;c[m>>2]=c[n>>2];c[q>>2]=c[f>>2];f=a[s]|0;if((f&1)==0){o=s+4|0;p=s+4|0}else{p=c[s+8>>2]|0;o=p}f=f&255;if((f&1|0)==0){f=f>>>1}else{f=c[s+4>>2]|0}xk(r,d,m,q,g,h,j,p,o+(f<<2)|0);c[n>>2]=c[r>>2];break};case 73:{j=j+8|0;c[s>>2]=c[f>>2];d=Kk(e,s,h,_,2)|0;g=c[h>>2]|0;do{if((g&4|0)==0){if((d-1|0)>>>0>=12>>>0){break}c[j>>2]=d;break a}}while(0);c[h>>2]=g|4;break};case 70:{aa=e|0;c[O>>2]=c[aa>>2];c[P>>2]=c[f>>2];xk(Q,d,O,P,g,h,j,19256,19288);c[aa>>2]=c[Q>>2];break};case 72:{c[T>>2]=c[f>>2];d=Kk(e,T,h,_,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<24){c[j+8>>2]=d;break a}else{c[h>>2]=g|4;break a}break};case 84:{aa=e|0;c[U>>2]=c[aa>>2];c[V>>2]=c[f>>2];xk(Z,d,U,V,g,h,j,19288,19320);c[aa>>2]=c[Z>>2];break};case 119:{c[u>>2]=c[f>>2];d=Kk(e,u,h,_,1)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<7){c[j+24>>2]=d;break a}else{c[h>>2]=g|4;break a}break};case 77:{c[v>>2]=c[f>>2];d=Kk(e,v,h,_,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<60){c[j+4>>2]=d;break a}else{c[h>>2]=g|4;break a}break};case 106:{c[w>>2]=c[f>>2];g=Kk(e,w,h,_,3)|0;d=c[h>>2]|0;if((d&4|0)==0&(g|0)<366){c[j+28>>2]=g;break a}else{c[h>>2]=d|4;break a}break};case 89:{c[x>>2]=c[f>>2];d=Kk(e,x,h,_,4)|0;if((c[h>>2]&4|0)!=0){break a}c[j+20>>2]=d-1900;break};case 37:{c[z>>2]=c[f>>2];Jk(0,e,z,h,_);break};case 68:{aa=e|0;c[A>>2]=c[aa>>2];c[B>>2]=c[f>>2];xk(C,d,A,B,g,h,j,19392,19424);c[aa>>2]=c[C>>2];break};case 110:case 116:{c[D>>2]=c[f>>2];Hk(0,e,D,h,_);break};case 112:{c[E>>2]=c[f>>2];Ik(d,j+8|0,e,E,h,_);break};case 114:{aa=e|0;c[F>>2]=c[aa>>2];c[G>>2]=c[f>>2];xk(H,d,F,G,g,h,j,19344,19388);c[aa>>2]=c[H>>2];break};case 82:{aa=e|0;c[I>>2]=c[aa>>2];c[J>>2]=c[f>>2];xk(K,d,I,J,g,h,j,19320,19340);c[aa>>2]=c[K>>2];break};case 83:{c[L>>2]=c[f>>2];d=Kk(e,L,h,_,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<61){c[j>>2]=d;break a}else{c[h>>2]=g|4;break a}break};case 109:{c[M>>2]=c[f>>2];d=Kk(e,M,h,_,2)|0;g=c[h>>2]|0;if((g&4|0)==0&(d|0)<13){c[j+16>>2]=d-1;break a}else{c[h>>2]=g|4;break a}break};case 99:{r=d+8|0;r=Ac[c[(c[r>>2]|0)+12>>2]&255](r)|0;m=e|0;c[o>>2]=c[m>>2];c[p>>2]=c[f>>2];s=a[r]|0;if((s&1)==0){f=r+4|0;q=r+4|0}else{q=c[r+8>>2]|0;f=q}s=s&255;if((s&1|0)==0){r=s>>>1}else{r=c[r+4>>2]|0}xk(n,d,o,p,g,h,j,q,f+(r<<2)|0);c[m>>2]=c[n>>2];break};case 100:case 101:{j=j+12|0;c[t>>2]=c[f>>2];g=Kk(e,t,h,_,2)|0;d=c[h>>2]|0;do{if((d&4|0)==0){if((g-1|0)>>>0>=31>>>0){break}c[j>>2]=g;break a}}while(0);c[h>>2]=d|4;break};case 121:{c[R>>2]=c[f>>2];d=Kk(e,R,h,_,4)|0;if((c[h>>2]&4|0)!=0){break a}if((d|0)<69){h=d+2e3|0}else{h=(d-69|0)>>>0<31>>>0?d+1900|0:d}c[j+20>>2]=h-1900;break};default:{c[h>>2]=c[h>>2]|4}}}while(0);c[b>>2]=c[e>>2];i=l;return}}while(0);aa=lc(4)|0;Xo(aa);y=0;Ha(16,aa|0,25592,150);if(y){y=0;aa=Mb(-1,-1)|0;$=c[S>>2]|0;$=$|0;xg($)|0;db(aa|0)}}function Hk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;a=i;h=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[h>>2];b=b|0;d=d|0;h=f;a:while(1){k=c[b>>2]|0;do{if((k|0)==0){l=1}else{j=c[k+12>>2]|0;if((j|0)==(c[k+16>>2]|0)){j=Ac[c[(c[k>>2]|0)+36>>2]&255](k)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[b>>2]=0;l=1;break}else{l=(c[b>>2]|0)==0;break}}}while(0);k=c[d>>2]|0;do{if((k|0)==0){g=15}else{j=c[k+12>>2]|0;if((j|0)==(c[k+16>>2]|0)){j=Ac[c[(c[k>>2]|0)+36>>2]&255](k)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[d>>2]=0;g=15;break}else{j=(k|0)==0;if(l^j){break}else{f=k;break a}}}}while(0);if((g|0)==15){g=0;if(l){f=0;j=1;break}else{k=0;j=1}}m=c[b>>2]|0;l=c[m+12>>2]|0;if((l|0)==(c[m+16>>2]|0)){l=Ac[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{l=c[l>>2]|0}if(!(Cc[c[(c[h>>2]|0)+12>>2]&127](f,8192,l)|0)){f=k;break}j=c[b>>2]|0;l=j+12|0;k=c[l>>2]|0;if((k|0)==(c[j+16>>2]|0)){Ac[c[(c[j>>2]|0)+40>>2]&255](j)|0;continue}else{c[l>>2]=k+4;continue}}h=c[b>>2]|0;do{if((h|0)==0){b=1}else{k=c[h+12>>2]|0;if((k|0)==(c[h+16>>2]|0)){h=Ac[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{h=c[k>>2]|0}if((h|0)==-1){c[b>>2]=0;b=1;break}else{b=(c[b>>2]|0)==0;break}}}while(0);do{if(j){g=37}else{h=c[f+12>>2]|0;if((h|0)==(c[f+16>>2]|0)){h=Ac[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{h=c[h>>2]|0}if((h|0)==-1){c[d>>2]=0;g=37;break}if(!(b^(f|0)==0)){break}i=a;return}}while(0);do{if((g|0)==37){if(b){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function Ik(a,b,e,f,g,h){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0;j=i;i=i+8|0;k=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[k>>2];k=j|0;a=a+8|0;a=Ac[c[(c[a>>2]|0)+8>>2]&255](a)|0;l=d[a]|0;if((l&1|0)==0){l=l>>>1}else{l=c[a+4>>2]|0}m=d[a+12|0]|0;if((m&1|0)==0){m=m>>>1}else{m=c[a+16>>2]|0}if((l|0)==(-m|0)){c[g>>2]=c[g>>2]|4;i=j;return}c[k>>2]=c[f>>2];m=jj(e,k,a,a+24|0,h,g,0)|0;h=m-a|0;do{if((m|0)==(a|0)){if((c[b>>2]|0)!=12){break}c[b>>2]=0;i=j;return}}while(0);if((h|0)!=12){i=j;return}h=c[b>>2]|0;if((h|0)>=12){i=j;return}c[b>>2]=h+12;i=j;return}function Jk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;a=i;h=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[h>>2];b=b|0;h=c[b>>2]|0;do{if((h|0)==0){k=1}else{j=c[h+12>>2]|0;if((j|0)==(c[h+16>>2]|0)){h=Ac[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{h=c[j>>2]|0}if((h|0)==-1){c[b>>2]=0;k=1;break}else{k=(c[b>>2]|0)==0;break}}}while(0);d=d|0;h=c[d>>2]|0;do{if((h|0)==0){g=14}else{j=c[h+12>>2]|0;if((j|0)==(c[h+16>>2]|0)){j=Ac[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{j=c[j>>2]|0}if((j|0)==-1){c[d>>2]=0;g=14;break}else{j=(h|0)==0;if(k^j){break}else{g=16;break}}}}while(0);if((g|0)==14){if(k){g=16}else{h=0;j=1}}if((g|0)==16){c[e>>2]=c[e>>2]|6;i=a;return}l=c[b>>2]|0;k=c[l+12>>2]|0;if((k|0)==(c[l+16>>2]|0)){k=Ac[c[(c[l>>2]|0)+36>>2]&255](l)|0}else{k=c[k>>2]|0}if((Cc[c[(c[f>>2]|0)+52>>2]&127](f,k,0)|0)<<24>>24!=37){c[e>>2]=c[e>>2]|4;i=a;return}k=c[b>>2]|0;f=k+12|0;l=c[f>>2]|0;if((l|0)==(c[k+16>>2]|0)){Ac[c[(c[k>>2]|0)+40>>2]&255](k)|0}else{c[f>>2]=l+4}f=c[b>>2]|0;do{if((f|0)==0){b=1}else{k=c[f+12>>2]|0;if((k|0)==(c[f+16>>2]|0)){f=Ac[c[(c[f>>2]|0)+36>>2]&255](f)|0}else{f=c[k>>2]|0}if((f|0)==-1){c[b>>2]=0;b=1;break}else{b=(c[b>>2]|0)==0;break}}}while(0);do{if(j){g=38}else{f=c[h+12>>2]|0;if((f|0)==(c[h+16>>2]|0)){f=Ac[c[(c[h>>2]|0)+36>>2]&255](h)|0}else{f=c[f>>2]|0}if((f|0)==-1){c[d>>2]=0;g=38;break}if(!(b^(h|0)==0)){break}i=a;return}}while(0);do{if((g|0)==38){if(b){break}i=a;return}}while(0);c[e>>2]=c[e>>2]|2;i=a;return}function Kk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;j=b;b=i;i=i+4|0;i=i+7&-8;c[b>>2]=c[j>>2];a=a|0;j=c[a>>2]|0;do{if((j|0)==0){j=1}else{k=c[j+12>>2]|0;if((k|0)==(c[j+16>>2]|0)){j=Ac[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{j=c[k>>2]|0}if((j|0)==-1){c[a>>2]=0;j=1;break}else{j=(c[a>>2]|0)==0;break}}}while(0);b=b|0;m=c[b>>2]|0;do{if((m|0)==0){h=14}else{k=c[m+12>>2]|0;if((k|0)==(c[m+16>>2]|0)){k=Ac[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{k=c[k>>2]|0}if((k|0)==-1){c[b>>2]=0;h=14;break}else{if(j^(m|0)==0){break}else{h=16;break}}}}while(0);if((h|0)==14){if(j){h=16}else{m=0}}if((h|0)==16){c[d>>2]=c[d>>2]|6;p=0;i=g;return p|0}j=c[a>>2]|0;k=c[j+12>>2]|0;if((k|0)==(c[j+16>>2]|0)){l=Ac[c[(c[j>>2]|0)+36>>2]&255](j)|0}else{l=c[k>>2]|0}j=e;if(!(Cc[c[(c[j>>2]|0)+12>>2]&127](e,2048,l)|0)){c[d>>2]=c[d>>2]|4;p=0;i=g;return p|0}k=e;l=(Cc[c[(c[k>>2]|0)+52>>2]&127](e,l,0)|0)<<24>>24;n=c[a>>2]|0;o=n+12|0;p=c[o>>2]|0;if((p|0)==(c[n+16>>2]|0)){Ac[c[(c[n>>2]|0)+40>>2]&255](n)|0}else{c[o>>2]=p+4}while(1){l=l-48|0;f=f-1|0;n=c[a>>2]|0;do{if((n|0)==0){p=0}else{o=c[n+12>>2]|0;if((o|0)==(c[n+16>>2]|0)){n=Ac[c[(c[n>>2]|0)+36>>2]&255](n)|0}else{n=c[o>>2]|0}if((n|0)==-1){c[a>>2]=0;p=0;break}else{p=c[a>>2]|0;break}}}while(0);n=(p|0)==0;if((m|0)==0){m=0}else{o=c[m+12>>2]|0;if((o|0)==(c[m+16>>2]|0)){o=Ac[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{o=c[o>>2]|0}if((o|0)==-1){c[b>>2]=0;m=0}p=c[a>>2]|0}o=(m|0)==0;if(!((n^o)&(f|0)>0)){break}n=c[p+12>>2]|0;if((n|0)==(c[p+16>>2]|0)){n=Ac[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{n=c[n>>2]|0}if(!(Cc[c[(c[j>>2]|0)+12>>2]&127](e,2048,n)|0)){h=63;break}l=((Cc[c[(c[k>>2]|0)+52>>2]&127](e,n,0)|0)<<24>>24)+(l*10|0)|0;o=c[a>>2]|0;n=o+12|0;p=c[n>>2]|0;if((p|0)==(c[o+16>>2]|0)){Ac[c[(c[o>>2]|0)+40>>2]&255](o)|0;continue}else{c[n>>2]=p+4;continue}}if((h|0)==63){i=g;return l|0}do{if((p|0)==0){a=1}else{e=c[p+12>>2]|0;if((e|0)==(c[p+16>>2]|0)){e=Ac[c[(c[p>>2]|0)+36>>2]&255](p)|0}else{e=c[e>>2]|0}if((e|0)==-1){c[a>>2]=0;a=1;break}else{a=(c[a>>2]|0)==0;break}}}while(0);do{if(o){h=60}else{e=c[m+12>>2]|0;if((e|0)==(c[m+16>>2]|0)){e=Ac[c[(c[m>>2]|0)+36>>2]&255](m)|0}else{e=c[e>>2]|0}if((e|0)==-1){c[b>>2]=0;h=60;break}if(!(a^(m|0)==0)){break}i=g;return l|0}}while(0);do{if((h|0)==60){if(a){break}i=g;return l|0}}while(0);c[d>>2]=c[d>>2]|2;p=l;i=g;return p|0}function Lk(b){b=b|0;var d=0,e=0,f=0,g=0;d=b;e=b+8|0;f=c[e>>2]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}g=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=g;break}else{y=0}g=Mb(-1,-1,0)|0;nd(g)}}while(0);if((f|0)==(c[7330]|0)){g=b|0;vg(g);xp(d);return}y=0;pa(238,c[e>>2]|0);if(!y){g=b|0;vg(g);xp(d);return}else{y=0}g=Mb(-1,-1,0)|0;nd(g)}function Mk(b){b=b|0;var d=0,e=0,f=0;d=b+8|0;e=c[d>>2]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}f=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=f;break}else{y=0}f=Mb(-1,-1,0)|0;nd(f)}}while(0);if((e|0)==(c[7330]|0)){f=b|0;vg(f);return}y=0;pa(238,c[d>>2]|0);if(!y){f=b|0;vg(f);return}else{y=0}f=Mb(-1,-1,0)|0;nd(f)}function Nk(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0;f=i;i=i+112|0;p=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[p>>2];p=f|0;n=f+8|0;g=n|0;o=p|0;a[o]=37;l=p+1|0;a[l]=j;m=p+2|0;a[m]=k;a[p+3|0]=0;if(k<<24>>24!=0){a[l]=k;a[m]=j}p=Gb(g|0,100,o|0,h|0,c[d+8>>2]|0)|0;j=n+p|0;e=c[e>>2]|0;if((p|0)==0){o=e;p=b|0;c[p>>2]=o;i=f;return}do{d=a[g]|0;if((e|0)==0){e=0}else{h=e+24|0;k=c[h>>2]|0;if((k|0)==(c[e+28>>2]|0)){h=Mc[c[(c[e>>2]|0)+52>>2]&63](e,d&255)|0}else{c[h>>2]=k+1;a[k]=d;h=d&255}e=(h|0)==-1?0:e}g=g+1|0;}while((g|0)!=(j|0));p=b|0;c[p>>2]=e;i=f;return}function Ok(b){b=b|0;var d=0,e=0,f=0,g=0;d=b;e=b+8|0;f=c[e>>2]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}g=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=g;break}else{y=0}g=Mb(-1,-1,0)|0;nd(g)}}while(0);if((f|0)==(c[7330]|0)){g=b|0;vg(g);xp(d);return}y=0;pa(238,c[e>>2]|0);if(!y){g=b|0;vg(g);xp(d);return}else{y=0}g=Mb(-1,-1,0)|0;nd(g)}function Pk(b){b=b|0;var d=0,e=0,f=0;d=b+8|0;e=c[d>>2]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}f=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=f;break}else{y=0}f=Mb(-1,-1,0)|0;nd(f)}}while(0);if((e|0)==(c[7330]|0)){f=b|0;vg(f);return}y=0;pa(238,c[d>>2]|0);if(!y){f=b|0;vg(f);return}else{y=0}f=Mb(-1,-1,0)|0;nd(f)}function Qk(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0;f=i;i=i+408|0;l=d;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[l>>2];l=f|0;k=f+400|0;d=l|0;c[k>>2]=l+400;Rk(b+8|0,d,k,g,h,j);h=c[k>>2]|0;j=c[e>>2]|0;if((d|0)==(h|0)){k=j;l=a|0;c[l>>2]=k;i=f;return}do{g=c[d>>2]|0;if((j|0)==0){j=0}else{b=j+24|0;e=c[b>>2]|0;if((e|0)==(c[j+28>>2]|0)){g=Mc[c[(c[j>>2]|0)+52>>2]&63](j,g)|0}else{c[b>>2]=e+4;c[e>>2]=g}j=(g|0)==-1?0:j}d=d+4|0;}while((d|0)!=(h|0));l=a|0;c[l>>2]=j;i=f;return}function Rk(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;i=i+120|0;q=j|0;l=j+112|0;k=i;i=i+4|0;i=i+7&-8;o=j+8|0;p=q|0;a[p]=37;n=q+1|0;a[n]=g;m=q+2|0;a[m]=h;a[q+3|0]=0;if(h<<24>>24!=0){a[n]=h;a[m]=g}b=b|0;Gb(o|0,100,p|0,f|0,c[b>>2]|0)|0;c[l>>2]=0;c[l+4>>2]=0;c[k>>2]=o;q=(c[e>>2]|0)-d>>2;b=_b(c[b>>2]|0)|0;k=(y=0,Ka(24,d|0,k|0,q|0,l|0)|0);if(y){y=0;l=Mb(-1,-1)|0;if((b|0)==0){db(l|0)}y=0,ra(44,b|0)|0;if(!y){db(l|0)}else{y=0;q=Mb(-1,-1,0)|0;nd(q)}}do{if((b|0)!=0){y=0,ra(44,b|0)|0;if(!y){break}else{y=0}q=Mb(-1,-1,0)|0;nd(q)}}while(0);if((k|0)==-1){Nl(14024)}else{c[e>>2]=d+(k<<2);i=j;return}}function Sk(a){a=a|0;vg(a|0);xp(a);return}function Tk(a){a=a|0;vg(a|0);return}function Uk(a){a=a|0;return 127}function Vk(a){a=a|0;return 127}function Wk(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function Xk(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function Yk(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function Zk(a,b){a=a|0;b=b|0;Xg(a,1,45);return}function _k(a){a=a|0;return 0}function $k(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D;D=D>>8;a[c+1|0]=D;D=D>>8;a[c+2|0]=D;D=D>>8;a[c+3|0]=D;return}function al(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D;D=D>>8;a[c+1|0]=D;D=D>>8;a[c+2|0]=D;D=D>>8;a[c+3|0]=D;return}function bl(a){a=a|0;vg(a|0);xp(a);return}function cl(a){a=a|0;vg(a|0);return}function dl(a){a=a|0;return 127}function el(a){a=a|0;return 127}function fl(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function gl(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function hl(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function il(a,b){a=a|0;b=b|0;Xg(a,1,45);return}function jl(a){a=a|0;return 0}function kl(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D;D=D>>8;a[c+1|0]=D;D=D>>8;a[c+2|0]=D;D=D>>8;a[c+3|0]=D;return}function ll(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D;D=D>>8;a[c+1|0]=D;D=D>>8;a[c+2|0]=D;D=D>>8;a[c+3|0]=D;return}function ml(a){a=a|0;vg(a|0);xp(a);return}function nl(a){a=a|0;vg(a|0);return}function ol(a){a=a|0;return 2147483647}function pl(a){a=a|0;return 2147483647}function ql(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function rl(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function sl(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function tl(a,b){a=a|0;b=b|0;ih(a,1,45);return}function ul(a){a=a|0;return 0}function vl(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D;D=D>>8;a[c+1|0]=D;D=D>>8;a[c+2|0]=D;D=D>>8;a[c+3|0]=D;return}function wl(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D;D=D>>8;a[c+1|0]=D;D=D>>8;a[c+2|0]=D;D=D>>8;a[c+3|0]=D;return}function xl(a){a=a|0;vg(a|0);xp(a);return}function yl(a){a=a|0;vg(a|0);return}function zl(a){a=a|0;return 2147483647}function Al(a){a=a|0;return 2147483647}function Bl(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function Cl(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function Dl(a,b){a=a|0;b=b|0;Pp(a|0,0,12)|0;return}function El(a,b){a=a|0;b=b|0;ih(a,1,45);return}function Fl(a){a=a|0;return 0}function Gl(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D;D=D>>8;a[c+1|0]=D;D=D>>8;a[c+2|0]=D;D=D>>8;a[c+3|0]=D;return}function Hl(b,c){b=b|0;c=c|0;c=b;D=67109634;a[c]=D;D=D>>8;a[c+1|0]=D;D=D>>8;a[c+2|0]=D;D=D>>8;a[c+3|0]=D;return}function Il(a){a=a|0;vg(a|0);xp(a);return}function Jl(a){a=a|0;vg(a|0);return}function Kl(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;q=i;i=i+280|0;r=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[r>>2];r=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[r>>2];r=q|0;F=q+16|0;C=q+120|0;x=q+128|0;D=q+136|0;A=q+144|0;E=q+152|0;z=q+160|0;B=q+176|0;o=F|0;n=C|0;c[n>>2]=o;d=C+4|0;c[d>>2]=210;F=F+100|0;y=0;qa(84,D|0,h|0);do{if(!y){o=D|0;G=c[o>>2]|0;if((c[7716]|0)==-1){r=4}else{c[r>>2]=30864;c[r+4>>2]=18;c[r+8>>2]=0;y=0;Ha(4,30864,r|0,114);if(!y){r=4}else{y=0;r=15}}a:do{if((r|0)==4){I=(c[7717]|0)-1|0;H=c[G+8>>2]|0;do{if((c[G+12>>2]|0)-H>>2>>>0>I>>>0){H=c[H+(I<<2)>>2]|0;if((H|0)==0){break}G=H;a[A]=0;f=f|0;c[E>>2]=c[f>>2];h=(y=0,sa(2,e|0,E|0,g|0,D|0,c[h+4>>2]|0,j|0,A|0,G|0,C|0,x|0,F|0)|0);if(y){y=0;r=15;break a}b:do{if(h){h=z|0;I=c[(c[H>>2]|0)+32>>2]|0;y=0,Ka(I|0,G|0,19240,19250,h|0)|0;if(y){y=0;r=15;break a}B=B|0;E=c[x>>2]|0;C=c[n>>2]|0;r=E-C|0;do{if((r|0)>98){r=qp(r+2|0)|0;if((r|0)!=0){D=r;g=r;r=19;break}y=0;Ia(4);if(!y){D=0;g=0;r=19}else{y=0;s=0;r=16}}else{D=B;g=0;r=19}}while(0);do{if((r|0)==19){if((a[A]&1)!=0){a[D]=45;D=D+1|0}if(C>>>0<E>>>0){A=z+10|0;do{F=a[C]|0;G=h;while(1){E=G+1|0;if((a[G]|0)==F<<24>>24){break}if((E|0)==(A|0)){G=A;break}else{G=E}}a[D]=a[19240+(G-z)|0]|0;C=C+1|0;D=D+1|0;}while(C>>>0<(c[x>>2]|0)>>>0)}a[D]=0;I=ac(B|0,17240,(H=i,i=i+8|0,c[H>>2]=k,H)|0)|0;i=H;if((I|0)==1){if((g|0)==0){break b}rp(g);break b}p=lc(8)|0;y=0;qa(68,p|0,16960);if(y){y=0;t=Mb(-1,-1)|0;kb(p|0);s=g;break}y=0;Ha(16,p|0,25608,30);if(y){y=0;s=g;r=16;break}}}while(0);if((r|0)==16){t=Mb(-1,-1)|0;}p=t;if((s|0)==0){break a}rp(s);break a}}while(0);s=e|0;t=c[s>>2]|0;do{if((t|0)==0){t=0}else{if((c[t+12>>2]|0)!=(c[t+16>>2]|0)){break}k=(y=0,ra(c[(c[t>>2]|0)+36>>2]|0,t|0)|0);if(y){y=0;r=15;break a}if((k|0)!=-1){break}c[s>>2]=0;t=0}}while(0);e=(t|0)==0;k=c[f>>2]|0;do{if((k|0)==0){r=45}else{if((c[k+12>>2]|0)!=(c[k+16>>2]|0)){if(e){break}else{r=47;break}}s=(y=0,ra(c[(c[k>>2]|0)+36>>2]|0,k|0)|0);if(y){y=0;r=15;break a}if((s|0)==-1){c[f>>2]=0;r=45;break}else{if(e^(k|0)==0){break}else{r=47;break}}}}while(0);if((r|0)==45){if(e){r=47}}if((r|0)==47){c[j>>2]=c[j>>2]|2}c[b>>2]=t;xg(c[o>>2]|0)|0;b=c[n>>2]|0;c[n>>2]=0;if((b|0)==0){i=q;return}y=0;pa(c[d>>2]|0,b|0);if(!y){i=q;return}else{y=0;I=Mb(-1,-1,0)|0;nd(I)}}}while(0);I=lc(4)|0;Xo(I);y=0;Ha(16,I|0,25592,150);if(y){y=0;r=15;break}}}while(0);if((r|0)==15){p=Mb(-1,-1)|0;}xg(c[o>>2]|0)|0;o=c[n>>2]|0;c[n>>2]=0;if((o|0)!=0){m=o;l=p;break}I=p;db(I|0)}else{y=0;l=Mb(-1,-1)|0;c[n>>2]=0;m=o}}while(0);y=0;pa(c[d>>2]|0,m|0);if(!y){I=l;db(I|0)}else{y=0;I=Mb(-1,-1,0)|0;nd(I)}}function Ll(a){a=a|0;return}function Ml(e,f,g,h,j,k,l,m,n,o,p){e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;var q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0;v=i;i=i+440|0;V=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[V>>2];V=v|0;H=v+400|0;G=v+408|0;E=v+416|0;r=v+424|0;z=r;q=i;i=i+12|0;i=i+7&-8;u=i;i=i+12|0;i=i+7&-8;t=i;i=i+12|0;i=i+7&-8;s=i;i=i+12|0;i=i+7&-8;D=i;i=i+4|0;i=i+7&-8;w=i;i=i+4|0;i=i+7&-8;W=V|0;c[H>>2]=0;Pp(z|0,0,12)|0;A=q;F=u;B=t;C=s;Pp(A|0,0,12)|0;Pp(F|0,0,12)|0;Pp(B|0,0,12)|0;Pp(C|0,0,12)|0;y=0;Ca(2,g|0,h|0,H|0,G|0,E|0,r|0,q|0,u|0,t|0,D|0);a:do{if(!y){g=n|0;c[o>>2]=c[g>>2];e=e|0;f=f|0;J=m+8|0;L=t+1|0;I=t+4|0;M=t+8|0;h=u+1|0;K=u+4|0;m=u+8|0;N=(j&512|0)!=0;j=q+1|0;R=q+4|0;S=q+8|0;Q=s+1|0;O=s+4|0;P=s+8|0;U=H+3|0;T=r+4|0;n=n+4|0;X=210;Y=W;Z=W;_=V+400|0;W=0;V=0;b:while(1){$=c[e>>2]|0;do{if(($|0)==0){$=0}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){break}$=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;x=24;break b}if(($|0)==-1){c[e>>2]=0;$=0;break}else{$=c[e>>2]|0;break}}}while(0);aa=($|0)==0;$=c[f>>2]|0;do{if(($|0)==0){x=15}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(aa){break}else{x=274;break b}}ba=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;x=24;break b}if((ba|0)==-1){c[f>>2]=0;x=15;break}else{if(aa){break}else{x=274;break b}}}}while(0);if((x|0)==15){x=0;if(aa){x=274;break}else{$=0}}c:do{switch(a[H+V|0]|0){case 1:{if((V|0)==3){x=274;break b}aa=c[e>>2]|0;x=c[aa+12>>2]|0;if((x|0)==(c[aa+16>>2]|0)){x=(y=0,ra(c[(c[aa>>2]|0)+36>>2]|0,aa|0)|0);if(y){y=0;x=24;break b}x=x&255}else{x=a[x]|0}aa=x<<24>>24;x=(y=0,ra(76,aa|0)|0);if(y){y=0;x=24;break b}if((x|0)==0){x=42;break b}if((b[(c[J>>2]|0)+(aa<<1)>>1]&8192)==0){x=42;break b}x=c[e>>2]|0;ba=x+12|0;aa=c[ba>>2]|0;if((aa|0)==(c[x+16>>2]|0)){x=(y=0,ra(c[(c[x>>2]|0)+40>>2]|0,x|0)|0);if(y){y=0;x=24;break b}x=x&255}else{c[ba>>2]=aa+1;x=a[aa]|0}y=0;qa(104,s|0,x|0);if(!y){x=43}else{y=0;x=24;break b}break};case 0:{x=43;break};case 3:{$=a[F]|0;aa=$&255;aa=(aa&1|0)==0?aa>>>1:c[K>>2]|0;ba=a[B]|0;ca=ba&255;ea=(ca&1|0)==0?ca>>>1:c[I>>2]|0;if((aa|0)==(-ea|0)){break c}ga=(aa|0)==0;da=c[e>>2]|0;ca=c[da+12>>2]|0;aa=c[da+16>>2]|0;fa=(ca|0)==(aa|0);if(!(ga|(ea|0)==0)){if(fa){$=(y=0,ra(c[(c[da>>2]|0)+36>>2]|0,da|0)|0);if(y){y=0;x=24;break b}aa=c[e>>2]|0;ba=$&255;$=a[F]|0;da=aa;ca=c[aa+12>>2]|0;aa=c[aa+16>>2]|0}else{ba=a[ca]|0}ea=da+12|0;aa=(ca|0)==(aa|0);if(ba<<24>>24==(a[($&1)==0?h:c[m>>2]|0]|0)){if(aa){ha=c[(c[da>>2]|0)+40>>2]|0;y=0,ra(ha|0,da|0)|0;if(y){y=0;x=24;break b}}else{c[ea>>2]=ca+1}$=d[F]|0;W=(($&1|0)==0?$>>>1:c[K>>2]|0)>>>0>1>>>0?u:W;break c}if(aa){$=(y=0,ra(c[(c[da>>2]|0)+36>>2]|0,da|0)|0);if(y){y=0;x=24;break b}$=$&255}else{$=a[ca]|0}if($<<24>>24!=(a[(a[B]&1)==0?L:c[M>>2]|0]|0)){x=110;break b}$=c[e>>2]|0;aa=$+12|0;ba=c[aa>>2]|0;if((ba|0)==(c[$+16>>2]|0)){ha=c[(c[$>>2]|0)+40>>2]|0;y=0,ra(ha|0,$|0)|0;if(y){y=0;x=24;break b}}else{c[aa>>2]=ba+1}a[l]=1;$=d[B]|0;W=(($&1|0)==0?$>>>1:c[I>>2]|0)>>>0>1>>>0?t:W;break c}if(ga){if(fa){$=(y=0,ra(c[(c[da>>2]|0)+36>>2]|0,da|0)|0);if(y){y=0;x=24;break b}$=$&255;ba=a[B]|0}else{$=a[ca]|0}if($<<24>>24!=(a[(ba&1)==0?L:c[M>>2]|0]|0)){break c}ba=c[e>>2]|0;$=ba+12|0;aa=c[$>>2]|0;if((aa|0)==(c[ba+16>>2]|0)){ha=c[(c[ba>>2]|0)+40>>2]|0;y=0,ra(ha|0,ba|0)|0;if(y){y=0;x=24;break b}}else{c[$>>2]=aa+1}a[l]=1;$=d[B]|0;W=(($&1|0)==0?$>>>1:c[I>>2]|0)>>>0>1>>>0?t:W;break c}if(fa){$=(y=0,ra(c[(c[da>>2]|0)+36>>2]|0,da|0)|0);if(y){y=0;x=24;break b}aa=$&255;$=a[F]|0}else{aa=a[ca]|0}if(aa<<24>>24!=(a[($&1)==0?h:c[m>>2]|0]|0)){a[l]=1;break c}$=c[e>>2]|0;aa=$+12|0;ba=c[aa>>2]|0;if((ba|0)==(c[$+16>>2]|0)){ha=c[(c[$>>2]|0)+40>>2]|0;y=0,ra(ha|0,$|0)|0;if(y){y=0;x=24;break b}}else{c[aa>>2]=ba+1}$=d[F]|0;W=(($&1|0)==0?$>>>1:c[K>>2]|0)>>>0>1>>>0?u:W;break};case 2:{if(!((W|0)!=0|V>>>0<2>>>0)){if((V|0)==2){aa=(a[U]|0)!=0}else{aa=0}if(!(N|aa)){W=0;break c}}ba=a[A]|0;ca=c[S>>2]|0;aa=(ba&1)==0?j:ca;d:do{if((V|0)!=0){if((d[H+(V-1)|0]|0)>>>0>=2>>>0){break}da=ba&255;e:do{if((((da&1|0)==0?da>>>1:c[R>>2]|0)|0)!=0){while(1){ba=a[aa]|0;ca=(y=0,ra(76,ba|0)|0);if(y){y=0;x=21;break b}if((ca|0)==0){break}if((b[(c[J>>2]|0)+(ba<<1)>>1]&8192)==0){break}aa=aa+1|0;ba=a[A]|0;ca=c[S>>2]|0;da=ba&255;if((aa|0)==(((ba&1)==0?j:ca)+((da&1|0)==0?da>>>1:c[R>>2]|0)|0)){break e}}ba=a[A]|0;ca=c[S>>2]|0}}while(0);da=(ba&1)==0?j:ca;fa=aa-da|0;ea=a[C]|0;ga=ea&255;ga=(ga&1|0)==0?ga>>>1:c[O>>2]|0;if(fa>>>0>ga>>>0){aa=da;break}ha=(ea&1)==0?Q:c[P>>2]|0;ea=ha+ga|0;if((aa|0)==(da|0)){break}ga=ha+(ga-fa)|0;fa=da;while(1){if((a[ga]|0)!=(a[fa]|0)){aa=da;break d}ga=ga+1|0;if((ga|0)==(ea|0)){break}else{fa=fa+1|0}}}}while(0);da=ba&255;f:do{if((aa|0)!=(((ba&1)==0?j:ca)+((da&1|0)==0?da>>>1:c[R>>2]|0)|0)){do{ba=c[e>>2]|0;do{if((ba|0)==0){ba=0}else{if((c[ba+12>>2]|0)!=(c[ba+16>>2]|0)){break}ba=(y=0,ra(c[(c[ba>>2]|0)+36>>2]|0,ba|0)|0);if(y){y=0;x=22;break b}if((ba|0)==-1){c[e>>2]=0;ba=0;break}else{ba=c[e>>2]|0;break}}}while(0);ba=(ba|0)==0;do{if(($|0)==0){x=141}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(ba){break}else{break f}}ca=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;x=22;break b}if((ca|0)==-1){c[f>>2]=0;x=141;break}else{if(ba){break}else{break f}}}}while(0);if((x|0)==141){x=0;if(ba){break f}else{$=0}}ba=c[e>>2]|0;ca=c[ba+12>>2]|0;if((ca|0)==(c[ba+16>>2]|0)){ba=(y=0,ra(c[(c[ba>>2]|0)+36>>2]|0,ba|0)|0);if(y){y=0;x=22;break b}ba=ba&255}else{ba=a[ca]|0}if(ba<<24>>24!=(a[aa]|0)){break f}ca=c[e>>2]|0;da=ca+12|0;ba=c[da>>2]|0;if((ba|0)==(c[ca+16>>2]|0)){ha=c[(c[ca>>2]|0)+40>>2]|0;y=0,ra(ha|0,ca|0)|0;if(y){y=0;x=22;break b}}else{c[da>>2]=ba+1}aa=aa+1|0;ha=a[A]|0;ba=ha&255;}while((aa|0)!=(((ha&1)==0?j:c[S>>2]|0)+((ba&1|0)==0?ba>>>1:c[R>>2]|0)|0))}}while(0);if(!N){break c}ha=a[A]|0;$=ha&255;if((aa|0)!=(((ha&1)==0?j:c[S>>2]|0)+(($&1|0)==0?$>>>1:c[R>>2]|0)|0)){x=154;break b}break};case 4:{$=0;g:while(1){aa=c[e>>2]|0;do{if((aa|0)==0){aa=0}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){break}aa=(y=0,ra(c[(c[aa>>2]|0)+36>>2]|0,aa|0)|0);if(y){y=0;x=19;break b}if((aa|0)==-1){c[e>>2]=0;aa=0;break}else{aa=c[e>>2]|0;break}}}while(0);aa=(aa|0)==0;ba=c[f>>2]|0;do{if((ba|0)==0){x=167}else{if((c[ba+12>>2]|0)!=(c[ba+16>>2]|0)){if(aa){break}else{break g}}ba=(y=0,ra(c[(c[ba>>2]|0)+36>>2]|0,ba|0)|0);if(y){y=0;x=19;break b}if((ba|0)==-1){c[f>>2]=0;x=167;break}else{if(aa){break}else{break g}}}}while(0);if((x|0)==167){x=0;if(aa){break}}aa=c[e>>2]|0;ba=c[aa+12>>2]|0;if((ba|0)==(c[aa+16>>2]|0)){aa=(y=0,ra(c[(c[aa>>2]|0)+36>>2]|0,aa|0)|0);if(y){y=0;x=19;break b}aa=aa&255}else{aa=a[ba]|0}ca=aa<<24>>24;ba=(y=0,ra(76,ca|0)|0);if(y){y=0;x=19;break b}do{if((ba|0)==0){x=187}else{if((b[(c[J>>2]|0)+(ca<<1)>>1]&2048)==0){x=187;break}ba=c[o>>2]|0;if((ba|0)==(p|0)){ca=(c[n>>2]|0)!=210;da=c[g>>2]|0;p=p-da|0;ba=p>>>0<2147483647>>>0?p<<1:-1;da=sp(ca?da:0,ba)|0;if((da|0)==0){y=0;Ia(4);if(y){y=0;x=19;break b}}do{if(ca){c[g>>2]=da}else{ca=c[g>>2]|0;c[g>>2]=da;if((ca|0)==0){break}y=0;pa(c[n>>2]|0,ca|0);if(y){y=0;x=184;break b}da=c[g>>2]|0}}while(0);c[n>>2]=94;ha=da+p|0;c[o>>2]=ha;p=(c[g>>2]|0)+ba|0;ba=ha}c[o>>2]=ba+1;a[ba]=aa;$=$+1|0}}while(0);if((x|0)==187){x=0;ba=d[z]|0;if((((ba&1|0)==0?ba>>>1:c[T>>2]|0)|0)==0|($|0)==0){break}if(aa<<24>>24!=(a[E]|0)){break}if((Z|0)==(_|0)){_=Z-Y|0;Z=_>>>0<2147483647>>>0?_<<1:-1;aa=_>>2;if((X|0)==210){_=0}else{_=Y}ha=sp(_,Z)|0;ba=ha;if((ha|0)==0){y=0;Ia(4);if(y){y=0;x=19;break b}}_=ba+(Z>>>2<<2)|0;Z=ba+(aa<<2)|0;Y=ba;X=94}c[Z>>2]=$;$=0;Z=Z+4|0}aa=c[e>>2]|0;ba=aa+12|0;ca=c[ba>>2]|0;if((ca|0)==(c[aa+16>>2]|0)){ha=c[(c[aa>>2]|0)+40>>2]|0;y=0,ra(ha|0,aa|0)|0;if(!y){continue}else{y=0;x=19;break b}}else{c[ba>>2]=ca+1;continue}}if(!((Y|0)==(Z|0)|($|0)==0)){if((Z|0)==(_|0)){Z=Z-Y|0;_=Z>>>0<2147483647>>>0?Z<<1:-1;Z=Z>>2;if((X|0)==210){aa=0}else{aa=Y}ha=sp(aa,_)|0;aa=ha;if((ha|0)==0){y=0;Ia(4);if(y){y=0;x=24;break b}}_=aa+(_>>>2<<2)|0;Z=aa+(Z<<2)|0;Y=aa;X=94}c[Z>>2]=$;Z=Z+4|0}if((c[D>>2]|0)>0){$=c[e>>2]|0;do{if(($|0)==0){$=0}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){break}$=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;x=24;break b}if(($|0)==-1){c[e>>2]=0;$=0;break}else{$=c[e>>2]|0;break}}}while(0);ba=($|0)==0;$=c[f>>2]|0;do{if(($|0)==0){x=220}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(ba){break}else{x=227;break b}}aa=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;x=24;break b}if((aa|0)==-1){c[f>>2]=0;x=220;break}else{if(ba){break}else{x=227;break b}}}}while(0);if((x|0)==220){x=0;if(ba){x=227;break b}else{$=0}}ba=c[e>>2]|0;aa=c[ba+12>>2]|0;if((aa|0)==(c[ba+16>>2]|0)){aa=(y=0,ra(c[(c[ba>>2]|0)+36>>2]|0,ba|0)|0);if(y){y=0;x=24;break b}aa=aa&255}else{aa=a[aa]|0}if(aa<<24>>24!=(a[G]|0)){x=227;break b}ca=c[e>>2]|0;ba=ca+12|0;aa=c[ba>>2]|0;if((aa|0)==(c[ca+16>>2]|0)){ha=c[(c[ca>>2]|0)+40>>2]|0;y=0,ra(ha|0,ca|0)|0;if(y){y=0;x=24;break b}}else{c[ba>>2]=aa+1}do{aa=c[e>>2]|0;do{if((aa|0)==0){aa=0}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){break}aa=(y=0,ra(c[(c[aa>>2]|0)+36>>2]|0,aa|0)|0);if(y){y=0;x=20;break b}if((aa|0)==-1){c[e>>2]=0;aa=0;break}else{aa=c[e>>2]|0;break}}}while(0);ba=(aa|0)==0;do{if(($|0)==0){x=243}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(ba){break}else{x=252;break b}}aa=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;x=20;break b}if((aa|0)==-1){c[f>>2]=0;x=243;break}else{if(ba){break}else{x=252;break b}}}}while(0);if((x|0)==243){x=0;if(ba){x=252;break b}else{$=0}}ba=c[e>>2]|0;aa=c[ba+12>>2]|0;if((aa|0)==(c[ba+16>>2]|0)){aa=(y=0,ra(c[(c[ba>>2]|0)+36>>2]|0,ba|0)|0);if(y){y=0;x=20;break b}aa=aa&255}else{aa=a[aa]|0}ba=aa<<24>>24;aa=(y=0,ra(76,ba|0)|0);if(y){y=0;x=20;break b}if((aa|0)==0){x=252;break b}if((b[(c[J>>2]|0)+(ba<<1)>>1]&2048)==0){x=252;break b}aa=c[o>>2]|0;if((aa|0)==(p|0)){ba=(c[n>>2]|0)!=210;ca=c[g>>2]|0;p=p-ca|0;aa=p>>>0<2147483647>>>0?p<<1:-1;ca=sp(ba?ca:0,aa)|0;if((ca|0)==0){y=0;Ia(4);if(y){y=0;x=20;break b}}do{if(ba){c[g>>2]=ca}else{ba=c[g>>2]|0;c[g>>2]=ca;if((ba|0)==0){break}y=0;pa(c[n>>2]|0,ba|0);if(y){y=0;x=261;break b}ca=c[g>>2]|0}}while(0);c[n>>2]=94;ha=ca+p|0;c[o>>2]=ha;p=(c[g>>2]|0)+aa|0;aa=ha}ba=c[e>>2]|0;ca=c[ba+12>>2]|0;if((ca|0)==(c[ba+16>>2]|0)){aa=(y=0,ra(c[(c[ba>>2]|0)+36>>2]|0,ba|0)|0);if(y){y=0;x=20;break b}ba=aa&255;aa=c[o>>2]|0}else{ba=a[ca]|0}c[o>>2]=aa+1;a[aa]=ba;aa=(c[D>>2]|0)-1|0;c[D>>2]=aa;ba=c[e>>2]|0;ca=ba+12|0;da=c[ca>>2]|0;if((da|0)==(c[ba+16>>2]|0)){ha=c[(c[ba>>2]|0)+40>>2]|0;y=0,ra(ha|0,ba|0)|0;if(y){y=0;x=20;break b}}else{c[ca>>2]=da+1}}while((aa|0)>0)}if((c[o>>2]|0)==(c[g>>2]|0)){x=272;break b}break};default:{}}}while(0);h:do{if((x|0)==43){x=0;if((V|0)==3){x=274;break b}while(1){aa=c[e>>2]|0;do{if((aa|0)==0){aa=0}else{if((c[aa+12>>2]|0)!=(c[aa+16>>2]|0)){break}aa=(y=0,ra(c[(c[aa>>2]|0)+36>>2]|0,aa|0)|0);if(y){y=0;x=23;break b}if((aa|0)==-1){c[e>>2]=0;aa=0;break}else{aa=c[e>>2]|0;break}}}while(0);ba=(aa|0)==0;do{if(($|0)==0){x=56}else{if((c[$+12>>2]|0)!=(c[$+16>>2]|0)){if(ba){break}else{break h}}aa=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;x=23;break b}if((aa|0)==-1){c[f>>2]=0;x=56;break}else{if(ba){break}else{break h}}}}while(0);if((x|0)==56){x=0;if(ba){break h}else{$=0}}aa=c[e>>2]|0;ba=c[aa+12>>2]|0;if((ba|0)==(c[aa+16>>2]|0)){aa=(y=0,ra(c[(c[aa>>2]|0)+36>>2]|0,aa|0)|0);if(y){y=0;x=23;break b}aa=aa&255}else{aa=a[ba]|0}ba=aa<<24>>24;aa=(y=0,ra(76,ba|0)|0);if(y){y=0;x=23;break b}if((aa|0)==0){break h}if((b[(c[J>>2]|0)+(ba<<1)>>1]&8192)==0){break h}ba=c[e>>2]|0;aa=ba+12|0;ca=c[aa>>2]|0;if((ca|0)==(c[ba+16>>2]|0)){aa=(y=0,ra(c[(c[ba>>2]|0)+40>>2]|0,ba|0)|0);if(y){y=0;x=23;break b}aa=aa&255}else{c[aa>>2]=ca+1;aa=a[ca]|0}y=0;qa(104,s|0,aa|0);if(y){y=0;x=23;break b}}}}while(0);V=V+1|0;if(V>>>0>=4>>>0){x=274;break}}i:do{if((x|0)==19){v=Mb(-1,-1)|0;break a}else if((x|0)==20){v=Mb(-1,-1)|0;break a}else if((x|0)==21){v=Mb(-1,-1)|0;break a}else if((x|0)==22){v=Mb(-1,-1)|0;break a}else if((x|0)==23){v=Mb(-1,-1)|0;break a}else if((x|0)==24){v=Mb(-1,-1)|0;break a}else if((x|0)==42){c[k>>2]=c[k>>2]|4;k=0}else if((x|0)==110){c[k>>2]=c[k>>2]|4;k=0}else if((x|0)==154){c[k>>2]=c[k>>2]|4;k=0}else if((x|0)==184){ha=Mb(-1,-1,0)|0;nd(ha);return 0}else if((x|0)==227){c[k>>2]=c[k>>2]|4;k=0}else if((x|0)==252){c[k>>2]=c[k>>2]|4;k=0}else if((x|0)==261){ha=Mb(-1,-1,0)|0;nd(ha);return 0}else if((x|0)==272){c[k>>2]=c[k>>2]|4;k=0}else if((x|0)==274){j:do{if((W|0)!=0){l=W;A=W+1|0;z=W+8|0;B=W+4|0;C=1;k:while(1){o=d[l]|0;if((o&1|0)==0){o=o>>>1}else{o=c[B>>2]|0}if(C>>>0>=o>>>0){break j}o=c[e>>2]|0;do{if((o|0)==0){o=0}else{if((c[o+12>>2]|0)!=(c[o+16>>2]|0)){break}o=(y=0,ra(c[(c[o>>2]|0)+36>>2]|0,o|0)|0);if(y){y=0;x=18;break k}if((o|0)==-1){c[e>>2]=0;o=0;break}else{o=c[e>>2]|0;break}}}while(0);o=(o|0)==0;D=c[f>>2]|0;do{if((D|0)==0){x=292}else{if((c[D+12>>2]|0)!=(c[D+16>>2]|0)){if(o){break}else{x=301;break k}}D=(y=0,ra(c[(c[D>>2]|0)+36>>2]|0,D|0)|0);if(y){y=0;x=18;break k}if((D|0)==-1){c[f>>2]=0;x=292;break}else{if(o){break}else{x=301;break k}}}}while(0);if((x|0)==292){x=0;if(o){x=301;break}}D=c[e>>2]|0;o=c[D+12>>2]|0;if((o|0)==(c[D+16>>2]|0)){o=(y=0,ra(c[(c[D>>2]|0)+36>>2]|0,D|0)|0);if(y){y=0;x=18;break}o=o&255}else{o=a[o]|0}if((a[l]&1)==0){D=A}else{D=c[z>>2]|0}if(o<<24>>24!=(a[D+C|0]|0)){x=301;break}C=C+1|0;o=c[e>>2]|0;D=o+12|0;E=c[D>>2]|0;if((E|0)==(c[o+16>>2]|0)){ha=c[(c[o>>2]|0)+40>>2]|0;y=0,ra(ha|0,o|0)|0;if(!y){continue}else{y=0;x=18;break}}else{c[D>>2]=E+1;continue}}if((x|0)==18){v=Mb(-1,-1)|0;break a}else if((x|0)==301){c[k>>2]=c[k>>2]|4;k=0;break i}}}while(0);if((Y|0)==(Z|0)){k=1;Y=Z;break}c[w>>2]=0;Rl(r,Y,Z,w);if((c[w>>2]|0)==0){k=1;break}c[k>>2]=c[k>>2]|4;k=0}}while(0);Yg(s);Yg(t);Yg(u);Yg(q);Yg(r);if((Y|0)==0){i=v;return k|0}y=0;pa(X|0,Y|0);if(!y){i=v;return k|0}else{y=0;ha=Mb(-1,-1,0)|0;nd(ha);return 0}}else{y=0;v=Mb(-1,-1)|0;Y=W;X=210}}while(0);Yg(s);Yg(t);Yg(u);Yg(q);Yg(r);if((Y|0)==0){db(v|0)}y=0;pa(X|0,Y|0);if(!y){db(v|0)}else{y=0;ha=Mb(-1,-1,0)|0;nd(ha);return 0}return 0}function Nl(a){a=a|0;var b=0;b=lc(8)|0;y=0;qa(68,b|0,a|0);if(!y){Hb(b|0,25608,30)}else{y=0;a=Mb(-1,-1)|0;kb(b|0);db(a|0)}}function Ol(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0;o=i;i=i+160|0;A=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[A>>2];A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=o|0;x=o+16|0;v=o+120|0;t=o+128|0;w=o+136|0;u=o+144|0;z=o+152|0;p=x|0;n=v|0;c[n>>2]=p;d=v+4|0;c[d>>2]=210;x=x+100|0;y=0;qa(84,w|0,h|0);do{if(!y){p=w|0;s=c[p>>2]|0;if((c[7716]|0)==-1){q=4}else{c[A>>2]=30864;c[A+4>>2]=18;c[A+8>>2]=0;y=0;Ha(4,30864,A|0,114);if(!y){q=4}else{y=0}}a:do{if((q|0)==4){A=(c[7717]|0)-1|0;B=c[s+8>>2]|0;do{if((c[s+12>>2]|0)-B>>2>>>0>A>>>0){B=c[B+(A<<2)>>2]|0;if((B|0)==0){break}A=B;a[u]=0;s=f|0;f=c[s>>2]|0;c[z>>2]=f;g=(y=0,sa(2,e|0,z|0,g|0,w|0,c[h+4>>2]|0,j|0,u|0,A|0,v|0,t|0,x|0)|0);if(y){y=0;break a}if(g){g=k;if((a[g]&1)==0){a[k+1|0]=0;a[g]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}if((a[u]&1)!=0){u=(y=0,Da(c[(c[B>>2]|0)+28>>2]|0,A|0,45)|0);if(y){y=0;break a}y=0;qa(104,k|0,u|0);if(y){y=0;break a}}u=(y=0,Da(c[(c[B>>2]|0)+28>>2]|0,A|0,48)|0);if(y){y=0;break a}h=c[n>>2]|0;t=c[t>>2]|0;g=t-1|0;b:do{if(h>>>0<g>>>0){while(1){v=h+1|0;if((a[h]|0)!=u<<24>>24){break b}if(v>>>0<g>>>0){h=v}else{h=v;break}}}}while(0);y=0,ta(48,k|0,h|0,t|0)|0;if(y){y=0;break a}}r=e|0;e=c[r>>2]|0;do{if((e|0)==0){e=0}else{if((c[e+12>>2]|0)!=(c[e+16>>2]|0)){break}k=(y=0,ra(c[(c[e>>2]|0)+36>>2]|0,e|0)|0);if(y){y=0;break a}if((k|0)!=-1){break}c[r>>2]=0;e=0}}while(0);r=(e|0)==0;do{if((f|0)==0){q=33}else{if((c[f+12>>2]|0)!=(c[f+16>>2]|0)){if(r){break}else{q=35;break}}k=(y=0,ra(c[(c[f>>2]|0)+36>>2]|0,f|0)|0);if(y){y=0;break a}if((k|0)==-1){c[s>>2]=0;q=33;break}else{if(r^(f|0)==0){break}else{q=35;break}}}}while(0);if((q|0)==33){if(r){q=35}}if((q|0)==35){c[j>>2]=c[j>>2]|2}c[b>>2]=e;xg(c[p>>2]|0)|0;b=c[n>>2]|0;c[n>>2]=0;if((b|0)==0){i=o;return}y=0;pa(c[d>>2]|0,b|0);if(!y){i=o;return}else{y=0;B=Mb(-1,-1,0)|0;nd(B)}}}while(0);B=lc(4)|0;Xo(B);y=0;Ha(16,B|0,25592,150);if(y){y=0;break}}}while(0);b=Mb(-1,-1)|0;xg(c[p>>2]|0)|0;o=c[n>>2]|0;c[n>>2]=0;if((o|0)!=0){l=o;m=b;break}B=b;db(B|0)}else{y=0;m=Mb(-1,-1)|0;c[n>>2]=0;l=p}}while(0);y=0;pa(c[d>>2]|0,l|0);if(!y){B=m;db(B|0)}else{y=0;B=Mb(-1,-1,0)|0;nd(B)}}function Pl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;i=d;k=a[f]|0;g=k&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+4>>2]|0}if((k&1)==0){j=10}else{k=c[b>>2]|0;j=(k&-2)-1|0;k=k&255}h=e-i|0;if((e|0)==(d|0)){return b|0}if((j-g|0)>>>0<h>>>0){fh(b,j,g+h-j|0,g,g,0,0);k=a[f]|0}if((k&1)==0){j=b+1|0}else{j=c[b+8>>2]|0}i=e+(g-i)|0;k=j+g|0;while(1){a[k]=a[d]|0;d=d+1|0;if((d|0)==(e|0)){break}else{k=k+1|0}}a[j+i|0]=0;e=g+h|0;if((a[f]&1)==0){a[f]=e<<1;return b|0}else{c[b+4>>2]=e;return b|0}return 0}function Ql(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0;n=i;i=i+56|0;I=n|0;J=n+16|0;H=n+32|0;B=n+40|0;C=B;z=i;i=i+12|0;i=i+7&-8;x=z;v=i;i=i+12|0;i=i+7&-8;s=v;q=i;i=i+12|0;i=i+7&-8;r=q;G=i;i=i+4|0;i=i+7&-8;F=i;i=i+12|0;i=i+7&-8;E=F;w=i;i=i+12|0;i=i+7&-8;A=w;u=i;i=i+12|0;i=i+7&-8;t=u;p=i;i=i+12|0;i=i+7&-8;o=p;if(b){o=c[d>>2]|0;if((c[7834]|0)!=-1){c[J>>2]=31336;c[J+4>>2]=18;c[J+8>>2]=0;Sg(31336,J,114)}t=(c[7835]|0)-1|0;p=c[o+8>>2]|0;if((c[o+12>>2]|0)-p>>2>>>0<=t>>>0){b=lc(4)|0;d=b;Xo(d);Hb(b|0,25592,150)}o=c[p+(t<<2)>>2]|0;if((o|0)==0){b=lc(4)|0;d=b;Xo(d);Hb(b|0,25592,150)}p=o;zc[c[(c[o>>2]|0)+44>>2]&127](H,p);D=c[H>>2]|0;a[e]=D;D=D>>8;a[e+1|0]=D;D=D>>8;a[e+2|0]=D;D=D>>8;a[e+3|0]=D;e=o;zc[c[(c[e>>2]|0)+32>>2]&127](B,p);t=l;if((a[t]&1)==0){a[l+1|0]=0;a[t]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}y=0;qa(6,l|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[t>>2]=c[C>>2];c[t+4>>2]=c[C+4>>2];c[t+8>>2]=c[C+8>>2];Pp(C|0,0,12)|0;Yg(B);zc[c[(c[e>>2]|0)+28>>2]&127](z,p);l=k;if((a[l]&1)==0){a[k+1|0]=0;a[l]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}y=0;qa(6,k|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[l>>2]=c[x>>2];c[l+4>>2]=c[x+4>>2];c[l+8>>2]=c[x+8>>2];Pp(x|0,0,12)|0;Yg(z);b=o;a[f]=Ac[c[(c[b>>2]|0)+12>>2]&255](p)|0;a[g]=Ac[c[(c[b>>2]|0)+16>>2]&255](p)|0;zc[c[(c[e>>2]|0)+20>>2]&127](v,p);f=h;if((a[f]&1)==0){a[h+1|0]=0;a[f]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}y=0;qa(6,h|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[f>>2]=c[s>>2];c[f+4>>2]=c[s+4>>2];c[f+8>>2]=c[s+8>>2];Pp(s|0,0,12)|0;Yg(v);zc[c[(c[e>>2]|0)+24>>2]&127](q,p);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}y=0;qa(6,j|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[h>>2]=c[r>>2];c[h+4>>2]=c[r+4>>2];c[h+8>>2]=c[r+8>>2];Pp(r|0,0,12)|0;Yg(q);b=Ac[c[(c[o>>2]|0)+36>>2]&255](p)|0;c[m>>2]=b;i=n;return}else{q=c[d>>2]|0;if((c[7836]|0)!=-1){c[I>>2]=31344;c[I+4>>2]=18;c[I+8>>2]=0;Sg(31344,I,114)}s=(c[7837]|0)-1|0;r=c[q+8>>2]|0;if((c[q+12>>2]|0)-r>>2>>>0<=s>>>0){b=lc(4)|0;d=b;Xo(d);Hb(b|0,25592,150)}r=c[r+(s<<2)>>2]|0;if((r|0)==0){b=lc(4)|0;d=b;Xo(d);Hb(b|0,25592,150)}q=r;zc[c[(c[r>>2]|0)+44>>2]&127](G,q);D=c[G>>2]|0;a[e]=D;D=D>>8;a[e+1|0]=D;D=D>>8;a[e+2|0]=D;D=D>>8;a[e+3|0]=D;e=r;zc[c[(c[e>>2]|0)+32>>2]&127](F,q);s=l;if((a[s]&1)==0){a[l+1|0]=0;a[s]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}y=0;qa(6,l|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[s>>2]=c[E>>2];c[s+4>>2]=c[E+4>>2];c[s+8>>2]=c[E+8>>2];Pp(E|0,0,12)|0;Yg(F);zc[c[(c[e>>2]|0)+28>>2]&127](w,q);l=k;if((a[l]&1)==0){a[k+1|0]=0;a[l]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}y=0;qa(6,k|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[l>>2]=c[A>>2];c[l+4>>2]=c[A+4>>2];c[l+8>>2]=c[A+8>>2];Pp(A|0,0,12)|0;Yg(w);b=r;a[f]=Ac[c[(c[b>>2]|0)+12>>2]&255](q)|0;a[g]=Ac[c[(c[b>>2]|0)+16>>2]&255](q)|0;zc[c[(c[e>>2]|0)+20>>2]&127](u,q);f=h;if((a[f]&1)==0){a[h+1|0]=0;a[f]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}y=0;qa(6,h|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[f>>2]=c[t>>2];c[f+4>>2]=c[t+4>>2];c[f+8>>2]=c[t+8>>2];Pp(t|0,0,12)|0;Yg(u);zc[c[(c[e>>2]|0)+24>>2]&127](p,q);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}y=0;qa(6,j|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[h>>2]=c[o>>2];c[h+4>>2]=c[o+4>>2];c[h+8>>2]=c[o+8>>2];Pp(o|0,0,12)|0;Yg(p);b=Ac[c[(c[r>>2]|0)+36>>2]&255](q)|0;c[m>>2]=b;i=n;return}}function Rl(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;g=b;h=b;i=a[h]|0;j=i&255;if((j&1|0)==0){j=j>>>1}else{j=c[b+4>>2]|0}if((j|0)==0){return}do{if((d|0)!=(e|0)){j=e-4|0;if(j>>>0>d>>>0){i=d}else{break}do{k=c[i>>2]|0;c[i>>2]=c[j>>2];c[j>>2]=k;i=i+4|0;j=j-4|0;}while(i>>>0<j>>>0);i=a[h]|0}}while(0);if((i&1)==0){g=g+1|0}else{g=c[b+8>>2]|0}h=i&255;if((h&1|0)==0){b=h>>>1}else{b=c[b+4>>2]|0}e=e-4|0;h=a[g]|0;i=h<<24>>24;h=h<<24>>24<1|h<<24>>24==127;a:do{if(e>>>0>d>>>0){b=g+b|0;while(1){if(!h){if((i|0)!=(c[d>>2]|0)){break}}g=(b-g|0)>1?g+1|0:g;d=d+4|0;h=a[g]|0;i=h<<24>>24;h=h<<24>>24<1|h<<24>>24==127;if(d>>>0>=e>>>0){break a}}c[f>>2]=4;return}}while(0);if(h){return}k=c[e>>2]|0;if(!(i>>>0<k>>>0|(k|0)==0)){return}c[f>>2]=4;return}function Sl(a){a=a|0;vg(a|0);xp(a);return}function Tl(a){a=a|0;vg(a|0);return}function Ul(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;q=i;i=i+600|0;r=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[r>>2];r=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[r>>2];r=q|0;F=q+16|0;C=q+416|0;x=q+424|0;E=q+432|0;A=q+440|0;D=q+448|0;z=q+456|0;B=q+496|0;o=F|0;n=C|0;c[n>>2]=o;d=C+4|0;c[d>>2]=210;F=F+400|0;y=0;qa(84,E|0,h|0);do{if(!y){o=E|0;G=c[o>>2]|0;if((c[7714]|0)==-1){r=4}else{c[r>>2]=30856;c[r+4>>2]=18;c[r+8>>2]=0;y=0;Ha(4,30856,r|0,114);if(!y){r=4}else{y=0;r=15}}a:do{if((r|0)==4){H=(c[7715]|0)-1|0;I=c[G+8>>2]|0;do{if((c[G+12>>2]|0)-I>>2>>>0>H>>>0){G=c[I+(H<<2)>>2]|0;if((G|0)==0){break}H=G;a[A]=0;f=f|0;c[D>>2]=c[f>>2];h=(y=0,sa(4,e|0,D|0,g|0,E|0,c[h+4>>2]|0,j|0,A|0,H|0,C|0,x|0,F|0)|0);if(y){y=0;r=15;break a}b:do{if(h){h=z|0;I=c[(c[G>>2]|0)+48>>2]|0;y=0,Ka(I|0,H|0,19224,19234,h|0)|0;if(y){y=0;r=15;break a}B=B|0;E=c[x>>2]|0;C=c[n>>2]|0;r=E-C|0;do{if((r|0)>392){r=qp((r>>2)+2|0)|0;if((r|0)!=0){D=r;g=r;r=19;break}y=0;Ia(4);if(!y){D=0;g=0;r=19}else{y=0;t=0;r=16}}else{D=B;g=0;r=19}}while(0);do{if((r|0)==19){if((a[A]&1)!=0){a[D]=45;D=D+1|0}if(C>>>0<E>>>0){A=z+40|0;do{E=c[C>>2]|0;F=h;while(1){G=F+4|0;if((c[F>>2]|0)==(E|0)){break}if((G|0)==(A|0)){F=A;break}else{F=G}}a[D]=a[19224+(F-z>>2)|0]|0;C=C+4|0;D=D+1|0;}while(C>>>0<(c[x>>2]|0)>>>0)}a[D]=0;I=ac(B|0,17240,(H=i,i=i+8|0,c[H>>2]=k,H)|0)|0;i=H;if((I|0)==1){if((g|0)==0){break b}rp(g);break b}p=lc(8)|0;y=0;qa(68,p|0,16960);if(y){y=0;s=Mb(-1,-1)|0;kb(p|0);t=g;break}y=0;Ha(16,p|0,25608,30);if(y){y=0;t=g;r=16;break}}}while(0);if((r|0)==16){s=Mb(-1,-1)|0;}p=s;if((t|0)==0){break a}rp(t);break a}}while(0);t=e|0;s=c[t>>2]|0;do{if((s|0)==0){s=0}else{k=c[s+12>>2]|0;if((k|0)==(c[s+16>>2]|0)){k=(y=0,ra(c[(c[s>>2]|0)+36>>2]|0,s|0)|0);if(y){y=0;r=15;break a}}else{k=c[k>>2]|0}if((k|0)!=-1){break}c[t>>2]=0;s=0}}while(0);k=(s|0)==0;t=c[f>>2]|0;do{if((t|0)==0){r=46}else{e=c[t+12>>2]|0;if((e|0)==(c[t+16>>2]|0)){e=(y=0,ra(c[(c[t>>2]|0)+36>>2]|0,t|0)|0);if(y){y=0;r=15;break a}}else{e=c[e>>2]|0}if((e|0)==-1){c[f>>2]=0;r=46;break}else{if(k^(t|0)==0){break}else{r=48;break}}}}while(0);if((r|0)==46){if(k){r=48}}if((r|0)==48){c[j>>2]=c[j>>2]|2}c[b>>2]=s;xg(c[o>>2]|0)|0;b=c[n>>2]|0;c[n>>2]=0;if((b|0)==0){i=q;return}y=0;pa(c[d>>2]|0,b|0);if(!y){i=q;return}else{y=0;I=Mb(-1,-1,0)|0;nd(I)}}}while(0);I=lc(4)|0;Xo(I);y=0;Ha(16,I|0,25592,150);if(y){y=0;r=15;break}}}while(0);if((r|0)==15){p=Mb(-1,-1)|0;}xg(c[o>>2]|0)|0;o=c[n>>2]|0;c[n>>2]=0;if((o|0)!=0){m=o;l=p;break}I=p;db(I|0)}else{y=0;l=Mb(-1,-1)|0;c[n>>2]=0;m=o}}while(0);y=0;pa(c[d>>2]|0,m|0);if(!y){I=l;db(I|0)}else{y=0;I=Mb(-1,-1,0)|0;nd(I)}}function Vl(b,e,f,g,h,j,k,l,m,n,o){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;var p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0;u=i;i=i+448|0;A=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[A>>2];A=u|0;R=u+8|0;J=u+408|0;x=u+416|0;B=u+424|0;r=u+432|0;z=r;q=i;i=i+12|0;i=i+7&-8;t=i;i=i+12|0;i=i+7&-8;s=i;i=i+12|0;i=i+7&-8;p=i;i=i+12|0;i=i+7&-8;C=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;c[A>>2]=o;S=R|0;c[J>>2]=0;Pp(z|0,0,12)|0;o=q;D=t;E=s;F=p;Pp(o|0,0,12)|0;Pp(D|0,0,12)|0;Pp(E|0,0,12)|0;Pp(F|0,0,12)|0;y=0;Ca(4,f|0,g|0,J|0,x|0,B|0,r|0,q|0,t|0,s|0,C|0);a:do{if(!y){g=m|0;c[n>>2]=c[g>>2];b=b|0;e=e|0;K=l;I=s+4|0;G=s+8|0;H=t+4|0;f=t+8|0;M=(h&512|0)!=0;N=q+4|0;O=q+8|0;P=p+4|0;Q=p+8|0;L=J+3|0;h=r+4|0;T=210;U=S;V=S;W=R+400|0;S=0;R=0;b:while(1){Y=c[b>>2]|0;do{if((Y|0)==0){Y=1}else{X=c[Y+12>>2]|0;if((X|0)==(c[Y+16>>2]|0)){X=(y=0,ra(c[(c[Y>>2]|0)+36>>2]|0,Y|0)|0);if(y){y=0;w=25;break b}}else{X=c[X>>2]|0}if((X|0)==-1){c[b>>2]=0;Y=1;break}else{Y=(c[b>>2]|0)==0;break}}}while(0);X=c[e>>2]|0;do{if((X|0)==0){w=16}else{Z=c[X+12>>2]|0;if((Z|0)==(c[X+16>>2]|0)){Z=(y=0,ra(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(y){y=0;w=25;break b}}else{Z=c[Z>>2]|0}if((Z|0)==-1){c[e>>2]=0;w=16;break}else{if(Y^(X|0)==0){break}else{w=256;break b}}}}while(0);if((w|0)==16){w=0;if(Y){w=256;break}else{X=0}}c:do{switch(a[J+R|0]|0){case 1:{if((R|0)==3){w=256;break b}w=c[b>>2]|0;Y=c[w+12>>2]|0;if((Y|0)==(c[w+16>>2]|0)){w=(y=0,ra(c[(c[w>>2]|0)+36>>2]|0,w|0)|0);if(y){y=0;w=25;break b}}else{w=c[Y>>2]|0}w=(y=0,ta(c[(c[K>>2]|0)+12>>2]|0,l|0,8192,w|0)|0);if(y){y=0;w=25;break b}if(!w){w=40;break b}Z=c[b>>2]|0;w=Z+12|0;Y=c[w>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){w=(y=0,ra(c[(c[Z>>2]|0)+40>>2]|0,Z|0)|0);if(y){y=0;w=25;break b}}else{c[w>>2]=Y+4;w=c[Y>>2]|0}y=0;qa(22,p|0,w|0);if(!y){w=41}else{y=0;w=25;break b}break};case 3:{X=a[D]|0;Z=X&255;_=(Z&1|0)==0;Y=a[E]|0;aa=Y&255;$=(aa&1|0)==0;if(((_?Z>>>1:c[H>>2]|0)|0)==(-($?aa>>>1:c[I>>2]|0)|0)){break c}do{if(((_?Z>>>1:c[H>>2]|0)|0)!=0){if((($?aa>>>1:c[I>>2]|0)|0)==0){break}Y=c[b>>2]|0;Z=c[Y+12>>2]|0;if((Z|0)==(c[Y+16>>2]|0)){Y=(y=0,ra(c[(c[Y>>2]|0)+36>>2]|0,Y|0)|0);if(y){y=0;w=25;break b}X=a[D]|0}else{Y=c[Z>>2]|0}Z=c[b>>2]|0;$=Z+12|0;_=c[$>>2]|0;aa=(_|0)==(c[Z+16>>2]|0);if((Y|0)==(c[((X&1)==0?H:c[f>>2]|0)>>2]|0)){if(aa){ca=c[(c[Z>>2]|0)+40>>2]|0;y=0,ra(ca|0,Z|0)|0;if(y){y=0;w=25;break b}}else{c[$>>2]=_+4}X=d[D]|0;S=((X&1|0)==0?X>>>1:c[H>>2]|0)>>>0>1>>>0?t:S;break c}if(aa){X=(y=0,ra(c[(c[Z>>2]|0)+36>>2]|0,Z|0)|0);if(y){y=0;w=25;break b}}else{X=c[_>>2]|0}if((X|0)!=(c[((a[E]&1)==0?I:c[G>>2]|0)>>2]|0)){w=106;break b}Z=c[b>>2]|0;Y=Z+12|0;X=c[Y>>2]|0;if((X|0)==(c[Z+16>>2]|0)){ca=c[(c[Z>>2]|0)+40>>2]|0;y=0,ra(ca|0,Z|0)|0;if(y){y=0;w=25;break b}}else{c[Y>>2]=X+4}a[k]=1;X=d[E]|0;S=((X&1|0)==0?X>>>1:c[I>>2]|0)>>>0>1>>>0?s:S;break c}}while(0);$=c[b>>2]|0;aa=c[$+12>>2]|0;ba=(aa|0)==(c[$+16>>2]|0);if(((_?Z>>>1:c[H>>2]|0)|0)==0){if(ba){X=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;w=25;break b}Y=a[E]|0}else{X=c[aa>>2]|0}if((X|0)!=(c[((Y&1)==0?I:c[G>>2]|0)>>2]|0)){break c}Z=c[b>>2]|0;Y=Z+12|0;X=c[Y>>2]|0;if((X|0)==(c[Z+16>>2]|0)){ca=c[(c[Z>>2]|0)+40>>2]|0;y=0,ra(ca|0,Z|0)|0;if(y){y=0;w=25;break b}}else{c[Y>>2]=X+4}a[k]=1;X=d[E]|0;S=((X&1|0)==0?X>>>1:c[I>>2]|0)>>>0>1>>>0?s:S;break c}if(ba){Y=(y=0,ra(c[(c[$>>2]|0)+36>>2]|0,$|0)|0);if(y){y=0;w=25;break b}X=a[D]|0}else{Y=c[aa>>2]|0}if((Y|0)!=(c[((X&1)==0?H:c[f>>2]|0)>>2]|0)){a[k]=1;break c}Z=c[b>>2]|0;Y=Z+12|0;X=c[Y>>2]|0;if((X|0)==(c[Z+16>>2]|0)){ca=c[(c[Z>>2]|0)+40>>2]|0;y=0,ra(ca|0,Z|0)|0;if(y){y=0;w=25;break b}}else{c[Y>>2]=X+4}X=d[D]|0;S=((X&1|0)==0?X>>>1:c[H>>2]|0)>>>0>1>>>0?t:S;break};case 0:{w=41;break};case 2:{if(!((S|0)!=0|R>>>0<2>>>0)){if((R|0)==2){Y=(a[L]|0)!=0}else{Y=0}if(!(M|Y)){S=0;break c}}Z=a[o]|0;Y=(Z&1)==0?N:c[O>>2]|0;d:do{if((R|0)!=0){if((d[J+(R-1)|0]|0)>>>0>=2>>>0){break}while(1){_=Z&255;if((Y|0)==(((Z&1)==0?N:c[O>>2]|0)+(((_&1|0)==0?_>>>1:c[N>>2]|0)<<2)|0)){break}Z=(y=0,ta(c[(c[K>>2]|0)+12>>2]|0,l|0,8192,c[Y>>2]|0)|0);if(y){y=0;w=22;break b}if(!Z){w=117;break}Y=Y+4|0;Z=a[o]|0}if((w|0)==117){w=0;Z=a[o]|0}_=(Z&1)==0;ba=Y-(_?N:c[O>>2]|0)>>2;ca=a[F]|0;aa=ca&255;$=(aa&1|0)==0;e:do{if(ba>>>0<=($?aa>>>1:c[P>>2]|0)>>>0){ca=(ca&1)==0;ba=(ca?P:c[Q>>2]|0)+(($?aa>>>1:c[P>>2]|0)-ba<<2)|0;$=(ca?P:c[Q>>2]|0)+(($?aa>>>1:c[P>>2]|0)<<2)|0;if((ba|0)==($|0)){break d}else{aa=_?N:c[O>>2]|0}while(1){if((c[ba>>2]|0)!=(c[aa>>2]|0)){break e}ba=ba+4|0;if((ba|0)==($|0)){break d}aa=aa+4|0}}}while(0);Y=_?N:c[O>>2]|0}}while(0);f:while(1){_=Z&255;if((Y|0)==(((Z&1)==0?N:c[O>>2]|0)+(((_&1|0)==0?_>>>1:c[N>>2]|0)<<2)|0)){break}Z=c[b>>2]|0;do{if((Z|0)==0){Z=1}else{_=c[Z+12>>2]|0;if((_|0)==(c[Z+16>>2]|0)){Z=(y=0,ra(c[(c[Z>>2]|0)+36>>2]|0,Z|0)|0);if(y){y=0;w=23;break b}}else{Z=c[_>>2]|0}if((Z|0)==-1){c[b>>2]=0;Z=1;break}else{Z=(c[b>>2]|0)==0;break}}}while(0);do{if((X|0)==0){w=138}else{_=c[X+12>>2]|0;if((_|0)==(c[X+16>>2]|0)){_=(y=0,ra(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(y){y=0;w=23;break b}}else{_=c[_>>2]|0}if((_|0)==-1){c[e>>2]=0;w=138;break}else{if(Z^(X|0)==0){break}else{break f}}}}while(0);if((w|0)==138){w=0;if(Z){break}else{X=0}}Z=c[b>>2]|0;_=c[Z+12>>2]|0;if((_|0)==(c[Z+16>>2]|0)){Z=(y=0,ra(c[(c[Z>>2]|0)+36>>2]|0,Z|0)|0);if(y){y=0;w=23;break b}}else{Z=c[_>>2]|0}if((Z|0)!=(c[Y>>2]|0)){break}Z=c[b>>2]|0;_=Z+12|0;$=c[_>>2]|0;if(($|0)==(c[Z+16>>2]|0)){ca=c[(c[Z>>2]|0)+40>>2]|0;y=0,ra(ca|0,Z|0)|0;if(y){y=0;w=23;break b}}else{c[_>>2]=$+4}Y=Y+4|0;Z=a[o]|0}if(!M){break c}ca=a[o]|0;X=ca&255;if((Y|0)!=(((ca&1)==0?N:c[O>>2]|0)+(((X&1|0)==0?X>>>1:c[N>>2]|0)<<2)|0)){w=150;break b}break};case 4:{X=0;g:while(1){Y=c[b>>2]|0;do{if((Y|0)==0){Y=1}else{Z=c[Y+12>>2]|0;if((Z|0)==(c[Y+16>>2]|0)){Y=(y=0,ra(c[(c[Y>>2]|0)+36>>2]|0,Y|0)|0);if(y){y=0;w=20;break b}}else{Y=c[Z>>2]|0}if((Y|0)==-1){c[b>>2]=0;Y=1;break}else{Y=(c[b>>2]|0)==0;break}}}while(0);Z=c[e>>2]|0;do{if((Z|0)==0){w=164}else{_=c[Z+12>>2]|0;if((_|0)==(c[Z+16>>2]|0)){_=(y=0,ra(c[(c[Z>>2]|0)+36>>2]|0,Z|0)|0);if(y){y=0;w=20;break b}}else{_=c[_>>2]|0}if((_|0)==-1){c[e>>2]=0;w=164;break}else{if(Y^(Z|0)==0){break}else{break g}}}}while(0);if((w|0)==164){w=0;if(Y){break}}Y=c[b>>2]|0;Z=c[Y+12>>2]|0;if((Z|0)==(c[Y+16>>2]|0)){Y=(y=0,ra(c[(c[Y>>2]|0)+36>>2]|0,Y|0)|0);if(y){y=0;w=20;break b}}else{Y=c[Z>>2]|0}Z=(y=0,ta(c[(c[K>>2]|0)+12>>2]|0,l|0,2048,Y|0)|0);if(y){y=0;w=20;break b}if(Z){Z=c[n>>2]|0;if((Z|0)==(c[A>>2]|0)){y=0;Ha(8,m|0,n|0,A|0);if(y){y=0;w=20;break b}Z=c[n>>2]|0}c[n>>2]=Z+4;c[Z>>2]=Y;X=X+1|0}else{Z=d[z]|0;if((((Z&1|0)==0?Z>>>1:c[h>>2]|0)|0)==0|(X|0)==0){break}if((Y|0)!=(c[B>>2]|0)){break}if((V|0)==(W|0)){W=(T|0)!=210;Y=V-U|0;V=Y>>>0<2147483647>>>0?Y<<1:-1;Y=Y>>2;if(W){Z=U}else{Z=0}ca=sp(Z,V)|0;Z=ca;if((ca|0)==0){y=0;Ia(4);if(y){y=0;w=20;break b}}W=Z+(V>>>2<<2)|0;V=Z+(Y<<2)|0;U=Z;T=94}c[V>>2]=X;X=0;V=V+4|0}_=c[b>>2]|0;Z=_+12|0;Y=c[Z>>2]|0;if((Y|0)==(c[_+16>>2]|0)){ca=c[(c[_>>2]|0)+40>>2]|0;y=0,ra(ca|0,_|0)|0;if(!y){continue}else{y=0;w=20;break b}}else{c[Z>>2]=Y+4;continue}}if(!((U|0)==(V|0)|(X|0)==0)){if((V|0)==(W|0)){W=(T|0)!=210;Y=V-U|0;V=Y>>>0<2147483647>>>0?Y<<1:-1;Y=Y>>2;if(W){Z=U}else{Z=0}ca=sp(Z,V)|0;Z=ca;if((ca|0)==0){y=0;Ia(4);if(y){y=0;w=25;break b}}W=Z+(V>>>2<<2)|0;V=Z+(Y<<2)|0;U=Z;T=94}c[V>>2]=X;V=V+4|0}X=c[C>>2]|0;if((X|0)>0){Y=c[b>>2]|0;do{if((Y|0)==0){Z=1}else{Z=c[Y+12>>2]|0;if((Z|0)==(c[Y+16>>2]|0)){Y=(y=0,ra(c[(c[Y>>2]|0)+36>>2]|0,Y|0)|0);if(y){y=0;w=25;break b}}else{Y=c[Z>>2]|0}if((Y|0)==-1){c[b>>2]=0;Z=1;break}else{Z=(c[b>>2]|0)==0;break}}}while(0);Y=c[e>>2]|0;do{if((Y|0)==0){w=213}else{_=c[Y+12>>2]|0;if((_|0)==(c[Y+16>>2]|0)){_=(y=0,ra(c[(c[Y>>2]|0)+36>>2]|0,Y|0)|0);if(y){y=0;w=25;break b}}else{_=c[_>>2]|0}if((_|0)==-1){c[e>>2]=0;w=213;break}else{if(Z^(Y|0)==0){break}else{w=219;break b}}}}while(0);if((w|0)==213){w=0;if(Z){w=219;break b}else{Y=0}}_=c[b>>2]|0;Z=c[_+12>>2]|0;if((Z|0)==(c[_+16>>2]|0)){Z=(y=0,ra(c[(c[_>>2]|0)+36>>2]|0,_|0)|0);if(y){y=0;w=25;break b}}else{Z=c[Z>>2]|0}if((Z|0)!=(c[x>>2]|0)){w=219;break b}Z=c[b>>2]|0;_=Z+12|0;$=c[_>>2]|0;if(($|0)==(c[Z+16>>2]|0)){ca=c[(c[Z>>2]|0)+40>>2]|0;y=0,ra(ca|0,Z|0)|0;if(y){y=0;w=25;break b}}else{c[_>>2]=$+4}do{_=c[b>>2]|0;do{if((_|0)==0){Z=1}else{Z=c[_+12>>2]|0;if((Z|0)==(c[_+16>>2]|0)){Z=(y=0,ra(c[(c[_>>2]|0)+36>>2]|0,_|0)|0);if(y){y=0;w=21;break b}}else{Z=c[Z>>2]|0}if((Z|0)==-1){c[b>>2]=0;Z=1;break}else{Z=(c[b>>2]|0)==0;break}}}while(0);do{if((Y|0)==0){w=236}else{_=c[Y+12>>2]|0;if((_|0)==(c[Y+16>>2]|0)){_=(y=0,ra(c[(c[Y>>2]|0)+36>>2]|0,Y|0)|0);if(y){y=0;w=21;break b}}else{_=c[_>>2]|0}if((_|0)==-1){c[e>>2]=0;w=236;break}else{if(Z^(Y|0)==0){break}else{w=243;break b}}}}while(0);if((w|0)==236){w=0;if(Z){w=243;break b}else{Y=0}}_=c[b>>2]|0;Z=c[_+12>>2]|0;if((Z|0)==(c[_+16>>2]|0)){Z=(y=0,ra(c[(c[_>>2]|0)+36>>2]|0,_|0)|0);if(y){y=0;w=21;break b}}else{Z=c[Z>>2]|0}Z=(y=0,ta(c[(c[K>>2]|0)+12>>2]|0,l|0,2048,Z|0)|0);if(y){y=0;w=21;break b}if(!Z){w=243;break b}if((c[n>>2]|0)==(c[A>>2]|0)){y=0;Ha(8,m|0,n|0,A|0);if(y){y=0;w=21;break b}}_=c[b>>2]|0;Z=c[_+12>>2]|0;if((Z|0)==(c[_+16>>2]|0)){Z=(y=0,ra(c[(c[_>>2]|0)+36>>2]|0,_|0)|0);if(y){y=0;w=21;break b}}else{Z=c[Z>>2]|0}_=c[n>>2]|0;c[n>>2]=_+4;c[_>>2]=Z;X=X-1|0;c[C>>2]=X;Z=c[b>>2]|0;_=Z+12|0;$=c[_>>2]|0;if(($|0)==(c[Z+16>>2]|0)){ca=c[(c[Z>>2]|0)+40>>2]|0;y=0,ra(ca|0,Z|0)|0;if(y){y=0;w=21;break b}}else{c[_>>2]=$+4}}while((X|0)>0)}if((c[n>>2]|0)==(c[g>>2]|0)){w=254;break b}break};default:{}}}while(0);h:do{if((w|0)==41){w=0;if((R|0)==3){w=256;break b}while(1){Z=c[b>>2]|0;do{if((Z|0)==0){Y=1}else{Y=c[Z+12>>2]|0;if((Y|0)==(c[Z+16>>2]|0)){Y=(y=0,ra(c[(c[Z>>2]|0)+36>>2]|0,Z|0)|0);if(y){y=0;w=24;break b}}else{Y=c[Y>>2]|0}if((Y|0)==-1){c[b>>2]=0;Y=1;break}else{Y=(c[b>>2]|0)==0;break}}}while(0);do{if((X|0)==0){w=55}else{Z=c[X+12>>2]|0;if((Z|0)==(c[X+16>>2]|0)){Z=(y=0,ra(c[(c[X>>2]|0)+36>>2]|0,X|0)|0);if(y){y=0;w=24;break b}}else{Z=c[Z>>2]|0}if((Z|0)==-1){c[e>>2]=0;w=55;break}else{if(Y^(X|0)==0){break}else{break h}}}}while(0);if((w|0)==55){w=0;if(Y){break h}else{X=0}}Y=c[b>>2]|0;Z=c[Y+12>>2]|0;if((Z|0)==(c[Y+16>>2]|0)){Y=(y=0,ra(c[(c[Y>>2]|0)+36>>2]|0,Y|0)|0);if(y){y=0;w=24;break b}}else{Y=c[Z>>2]|0}Y=(y=0,ta(c[(c[K>>2]|0)+12>>2]|0,l|0,8192,Y|0)|0);if(y){y=0;w=24;break b}if(!Y){break h}_=c[b>>2]|0;Y=_+12|0;Z=c[Y>>2]|0;if((Z|0)==(c[_+16>>2]|0)){Y=(y=0,ra(c[(c[_>>2]|0)+40>>2]|0,_|0)|0);if(y){y=0;w=24;break b}}else{c[Y>>2]=Z+4;Y=c[Z>>2]|0}y=0;qa(22,p|0,Y|0);if(y){y=0;w=24;break b}}}}while(0);R=R+1|0;if(R>>>0>=4>>>0){w=256;break}}i:do{if((w|0)==20){u=Mb(-1,-1)|0;break a}else if((w|0)==21){u=Mb(-1,-1)|0;break a}else if((w|0)==22){u=Mb(-1,-1)|0;break a}else if((w|0)==23){u=Mb(-1,-1)|0;break a}else if((w|0)==24){u=Mb(-1,-1)|0;break a}else if((w|0)==25){u=Mb(-1,-1)|0;break a}else if((w|0)==40){c[j>>2]=c[j>>2]|4;v=0}else if((w|0)==106){c[j>>2]=c[j>>2]|4;v=0}else if((w|0)==150){c[j>>2]=c[j>>2]|4;v=0}else if((w|0)==219){c[j>>2]=c[j>>2]|4;v=0}else if((w|0)==243){c[j>>2]=c[j>>2]|4;v=0}else if((w|0)==254){c[j>>2]=c[j>>2]|4;v=0}else if((w|0)==256){j:do{if((S|0)!=0){x=S;m=S+4|0;l=S+8|0;k=1;k:while(1){n=d[x]|0;if((n&1|0)==0){n=n>>>1}else{n=c[m>>2]|0}if(k>>>0>=n>>>0){break j}n=c[b>>2]|0;do{if((n|0)==0){n=1}else{z=c[n+12>>2]|0;if((z|0)==(c[n+16>>2]|0)){n=(y=0,ra(c[(c[n>>2]|0)+36>>2]|0,n|0)|0);if(y){y=0;w=19;break k}}else{n=c[z>>2]|0}if((n|0)==-1){c[b>>2]=0;n=1;break}else{n=(c[b>>2]|0)==0;break}}}while(0);z=c[e>>2]|0;do{if((z|0)==0){w=275}else{A=c[z+12>>2]|0;if((A|0)==(c[z+16>>2]|0)){A=(y=0,ra(c[(c[z>>2]|0)+36>>2]|0,z|0)|0);if(y){y=0;w=19;break k}}else{A=c[A>>2]|0}if((A|0)==-1){c[e>>2]=0;w=275;break}else{if(n^(z|0)==0){break}else{w=283;break k}}}}while(0);if((w|0)==275){w=0;if(n){w=283;break}}n=c[b>>2]|0;z=c[n+12>>2]|0;if((z|0)==(c[n+16>>2]|0)){n=(y=0,ra(c[(c[n>>2]|0)+36>>2]|0,n|0)|0);if(y){y=0;w=19;break}}else{n=c[z>>2]|0}if((a[x]&1)==0){z=m}else{z=c[l>>2]|0}if((n|0)!=(c[z+(k<<2)>>2]|0)){w=283;break}k=k+1|0;z=c[b>>2]|0;n=z+12|0;A=c[n>>2]|0;if((A|0)==(c[z+16>>2]|0)){ca=c[(c[z>>2]|0)+40>>2]|0;y=0,ra(ca|0,z|0)|0;if(!y){continue}else{y=0;w=19;break}}else{c[n>>2]=A+4;continue}}if((w|0)==19){u=Mb(-1,-1)|0;break a}else if((w|0)==283){c[j>>2]=c[j>>2]|4;v=0;break i}}}while(0);if((U|0)==(V|0)){v=1;U=V;break}c[v>>2]=0;Rl(r,U,V,v);if((c[v>>2]|0)==0){v=1;break}c[j>>2]=c[j>>2]|4;v=0}}while(0);jh(p);jh(s);jh(t);jh(q);Yg(r);if((U|0)==0){i=u;return v|0}y=0;pa(T|0,U|0);if(!y){i=u;return v|0}else{y=0;ca=Mb(-1,-1,0)|0;nd(ca);return 0}}else{y=0;u=Mb(-1,-1)|0;U=S;T=210}}while(0);jh(p);jh(s);jh(t);jh(q);Yg(r);if((U|0)==0){db(u|0)}y=0;pa(T|0,U|0);if(!y){db(u|0)}else{y=0;ca=Mb(-1,-1,0)|0;nd(ca);return 0}return 0}function Wl(b,d,e,f,g,h,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0;o=i;i=i+456|0;A=e;e=i;i=i+4|0;i=i+7&-8;c[e>>2]=c[A>>2];A=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[A>>2];A=o|0;w=o+16|0;z=o+416|0;t=o+424|0;v=o+432|0;u=o+440|0;x=o+448|0;p=w|0;n=z|0;c[n>>2]=p;d=z+4|0;c[d>>2]=210;w=w+400|0;y=0;qa(84,v|0,h|0);do{if(!y){p=v|0;r=c[p>>2]|0;if((c[7714]|0)==-1){q=4}else{c[A>>2]=30856;c[A+4>>2]=18;c[A+8>>2]=0;y=0;Ha(4,30856,A|0,114);if(!y){q=4}else{y=0}}a:do{if((q|0)==4){B=(c[7715]|0)-1|0;A=c[r+8>>2]|0;do{if((c[r+12>>2]|0)-A>>2>>>0>B>>>0){B=c[A+(B<<2)>>2]|0;if((B|0)==0){break}A=B;a[u]=0;r=f|0;f=c[r>>2]|0;c[x>>2]=f;h=(y=0,sa(4,e|0,x|0,g|0,v|0,c[h+4>>2]|0,j|0,u|0,A|0,z|0,t|0,w|0)|0);if(y){y=0;break a}if(h){h=k;if((a[h]&1)==0){c[k+4>>2]=0;a[h]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}if((a[u]&1)!=0){u=(y=0,Da(c[(c[B>>2]|0)+44>>2]|0,A|0,45)|0);if(y){y=0;break a}y=0;qa(22,k|0,u|0);if(y){y=0;break a}}u=(y=0,Da(c[(c[B>>2]|0)+44>>2]|0,A|0,48)|0);if(y){y=0;break a}g=c[n>>2]|0;t=c[t>>2]|0;h=t-4|0;b:do{if(g>>>0<h>>>0){while(1){v=g+4|0;if((c[g>>2]|0)!=(u|0)){break b}if(v>>>0<h>>>0){g=v}else{g=v;break}}}}while(0);y=0,ta(10,k|0,g|0,t|0)|0;if(y){y=0;break a}}e=e|0;k=c[e>>2]|0;do{if((k|0)==0){k=0}else{s=c[k+12>>2]|0;if((s|0)==(c[k+16>>2]|0)){s=(y=0,ra(c[(c[k>>2]|0)+36>>2]|0,k|0)|0);if(y){y=0;break a}}else{s=c[s>>2]|0}if((s|0)!=-1){break}c[e>>2]=0;k=0}}while(0);e=(k|0)==0;do{if((f|0)==0){q=34}else{s=c[f+12>>2]|0;if((s|0)==(c[f+16>>2]|0)){s=(y=0,ra(c[(c[f>>2]|0)+36>>2]|0,f|0)|0);if(y){y=0;break a}}else{s=c[s>>2]|0}if((s|0)==-1){c[r>>2]=0;q=34;break}else{if(e^(f|0)==0){break}else{q=36;break}}}}while(0);if((q|0)==34){if(e){q=36}}if((q|0)==36){c[j>>2]=c[j>>2]|2}c[b>>2]=k;xg(c[p>>2]|0)|0;b=c[n>>2]|0;c[n>>2]=0;if((b|0)==0){i=o;return}y=0;pa(c[d>>2]|0,b|0);if(!y){i=o;return}else{y=0;B=Mb(-1,-1,0)|0;nd(B)}}}while(0);B=lc(4)|0;Xo(B);y=0;Ha(16,B|0,25592,150);if(y){y=0;break}}}while(0);b=Mb(-1,-1)|0;xg(c[p>>2]|0)|0;o=c[n>>2]|0;c[n>>2]=0;if((o|0)!=0){l=o;m=b;break}B=b;db(B|0)}else{y=0;m=Mb(-1,-1)|0;c[n>>2]=0;l=p}}while(0);y=0;pa(c[d>>2]|0,l|0);if(!y){B=m;db(B|0)}else{y=0;B=Mb(-1,-1,0)|0;nd(B)}}function Xl(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=b;i=d;k=a[f]|0;g=k&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+4>>2]|0}if((k&1)==0){j=1}else{k=c[b>>2]|0;j=(k&-2)-1|0;k=k&255}h=e-i>>2;if((h|0)==0){return b|0}if((j-g|0)>>>0<h>>>0){ph(b,j,g+h-j|0,g,g,0,0);k=a[f]|0}if((k&1)==0){j=b+4|0}else{j=c[b+8>>2]|0}k=j+(g<<2)|0;if((d|0)!=(e|0)){i=g+((e-4+(-i|0)|0)>>>2)+1|0;while(1){c[k>>2]=c[d>>2];d=d+4|0;if((d|0)==(e|0)){break}else{k=k+4|0}}k=j+(i<<2)|0}c[k>>2]=0;g=g+h|0;if((a[f]&1)==0){a[f]=g<<1;return b|0}else{c[b+4>>2]=g;return b|0}return 0}function Yl(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0;n=i;i=i+56|0;I=n|0;J=n+16|0;H=n+32|0;B=n+40|0;C=B;z=i;i=i+12|0;i=i+7&-8;x=z;v=i;i=i+12|0;i=i+7&-8;s=v;r=i;i=i+12|0;i=i+7&-8;q=r;G=i;i=i+4|0;i=i+7&-8;F=i;i=i+12|0;i=i+7&-8;E=F;w=i;i=i+12|0;i=i+7&-8;A=w;u=i;i=i+12|0;i=i+7&-8;t=u;p=i;i=i+12|0;i=i+7&-8;o=p;if(b){o=c[d>>2]|0;if((c[7830]|0)!=-1){c[J>>2]=31320;c[J+4>>2]=18;c[J+8>>2]=0;Sg(31320,J,114)}t=(c[7831]|0)-1|0;p=c[o+8>>2]|0;if((c[o+12>>2]|0)-p>>2>>>0<=t>>>0){b=lc(4)|0;d=b;Xo(d);Hb(b|0,25592,150)}p=c[p+(t<<2)>>2]|0;if((p|0)==0){b=lc(4)|0;d=b;Xo(d);Hb(b|0,25592,150)}o=p;zc[c[(c[p>>2]|0)+44>>2]&127](H,o);t=e;D=c[H>>2]|0;a[t]=D;D=D>>8;a[t+1|0]=D;D=D>>8;a[t+2|0]=D;D=D>>8;a[t+3|0]=D;t=p;zc[c[(c[t>>2]|0)+32>>2]&127](B,o);u=l;if((a[u]&1)==0){c[l+4>>2]=0;a[u]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}y=0;qa(64,l|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[u>>2]=c[C>>2];c[u+4>>2]=c[C+4>>2];c[u+8>>2]=c[C+8>>2];Pp(C|0,0,12)|0;jh(B);zc[c[(c[t>>2]|0)+28>>2]&127](z,o);l=k;if((a[l]&1)==0){c[k+4>>2]=0;a[l]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}y=0;qa(64,k|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[l>>2]=c[x>>2];c[l+4>>2]=c[x+4>>2];c[l+8>>2]=c[x+8>>2];Pp(x|0,0,12)|0;jh(z);k=p;c[f>>2]=Ac[c[(c[k>>2]|0)+12>>2]&255](o)|0;c[g>>2]=Ac[c[(c[k>>2]|0)+16>>2]&255](o)|0;zc[c[(c[p>>2]|0)+20>>2]&127](v,o);g=h;if((a[g]&1)==0){a[h+1|0]=0;a[g]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}y=0;qa(6,h|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[g>>2]=c[s>>2];c[g+4>>2]=c[s+4>>2];c[g+8>>2]=c[s+8>>2];Pp(s|0,0,12)|0;Yg(v);zc[c[(c[t>>2]|0)+24>>2]&127](r,o);h=j;if((a[h]&1)==0){c[j+4>>2]=0;a[h]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}y=0;qa(64,j|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[h>>2]=c[q>>2];c[h+4>>2]=c[q+4>>2];c[h+8>>2]=c[q+8>>2];Pp(q|0,0,12)|0;jh(r);b=Ac[c[(c[k>>2]|0)+36>>2]&255](o)|0;c[m>>2]=b;i=n;return}else{q=c[d>>2]|0;if((c[7832]|0)!=-1){c[I>>2]=31328;c[I+4>>2]=18;c[I+8>>2]=0;Sg(31328,I,114)}s=(c[7833]|0)-1|0;r=c[q+8>>2]|0;if((c[q+12>>2]|0)-r>>2>>>0<=s>>>0){b=lc(4)|0;d=b;Xo(d);Hb(b|0,25592,150)}r=c[r+(s<<2)>>2]|0;if((r|0)==0){b=lc(4)|0;d=b;Xo(d);Hb(b|0,25592,150)}q=r;zc[c[(c[r>>2]|0)+44>>2]&127](G,q);s=e;D=c[G>>2]|0;a[s]=D;D=D>>8;a[s+1|0]=D;D=D>>8;a[s+2|0]=D;D=D>>8;a[s+3|0]=D;s=r;zc[c[(c[s>>2]|0)+32>>2]&127](F,q);e=l;if((a[e]&1)==0){c[l+4>>2]=0;a[e]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}y=0;qa(64,l|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[e>>2]=c[E>>2];c[e+4>>2]=c[E+4>>2];c[e+8>>2]=c[E+8>>2];Pp(E|0,0,12)|0;jh(F);zc[c[(c[s>>2]|0)+28>>2]&127](w,q);l=k;if((a[l]&1)==0){c[k+4>>2]=0;a[l]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}y=0;qa(64,k|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[l>>2]=c[A>>2];c[l+4>>2]=c[A+4>>2];c[l+8>>2]=c[A+8>>2];Pp(A|0,0,12)|0;jh(w);k=r;c[f>>2]=Ac[c[(c[k>>2]|0)+12>>2]&255](q)|0;c[g>>2]=Ac[c[(c[k>>2]|0)+16>>2]&255](q)|0;zc[c[(c[r>>2]|0)+20>>2]&127](u,q);g=h;if((a[g]&1)==0){a[h+1|0]=0;a[g]=0}else{a[c[h+8>>2]|0]=0;c[h+4>>2]=0}y=0;qa(6,h|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[g>>2]=c[t>>2];c[g+4>>2]=c[t+4>>2];c[g+8>>2]=c[t+8>>2];Pp(t|0,0,12)|0;Yg(u);zc[c[(c[s>>2]|0)+24>>2]&127](p,q);h=j;if((a[h]&1)==0){c[j+4>>2]=0;a[h]=0}else{c[c[j+8>>2]>>2]=0;c[j+4>>2]=0}y=0;qa(64,j|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[h>>2]=c[o>>2];c[h+4>>2]=c[o+4>>2];c[h+8>>2]=c[o+8>>2];Pp(o|0,0,12)|0;jh(p);b=Ac[c[(c[k>>2]|0)+36>>2]&255](q)|0;c[m>>2]=b;i=n;return}}function Zl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;f=a+4|0;g=(c[f>>2]|0)!=210;a=a|0;j=c[a>>2]|0;i=j;h=(c[d>>2]|0)-i|0;h=h>>>0<2147483647>>>0?h<<1:-1;i=(c[b>>2]|0)-i>>2;if(g){}else{j=0}k=sp(j,h)|0;j=k;if((k|0)==0){Cp()}do{if(g){c[a>>2]=j;e=j}else{g=c[a>>2]|0;c[a>>2]=j;if((g|0)==0){e=j;break}y=0;pa(c[f>>2]|0,g|0);if(!y){e=c[a>>2]|0;break}else{y=0;k=Mb(-1,-1,0)|0;nd(k)}}}while(0);c[f>>2]=94;c[b>>2]=e+(i<<2);c[d>>2]=(c[a>>2]|0)+(h>>>2<<2);return}function _l(a){a=a|0;vg(a|0);xp(a);return}function $l(a){a=a|0;vg(a|0);return}function am(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;q=i;i=i+248|0;L=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[L>>2];L=q|0;J=q+120|0;I=q+232|0;G=q+240|0;s=G;r=i;i=i+1|0;i=i+7&-8;p=i;i=i+1|0;i=i+7&-8;o=i;i=i+12|0;i=i+7&-8;K=o;m=i;i=i+12|0;i=i+7&-8;C=m;n=i;i=i+12|0;i=i+7&-8;D=n;F=i;i=i+4|0;i=i+7&-8;H=i;i=i+100|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;v=i;i=i+4|0;i=i+7&-8;N=q+16|0;c[J>>2]=N;z=q+128|0;A=gb(N|0,100,16760,(N=i,i=i+8|0,h[N>>3]=l,N)|0)|0;i=N;a:do{if(A>>>0>99>>>0){do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}e=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=e;break}else{y=0;E=Mb(-1,-1)|0;x=0;w=0;e=12;break a}}}while(0);A=(y=0,Ka(4,J|0,c[7330]|0,16760,(N=i,i=i+8|0,h[N>>3]=l,N)|0)|0);i=N;if(y){y=0;x=0;w=0;e=11;break}x=c[J>>2]|0;if((x|0)==0){y=0;Ia(4);if(y){y=0;x=0;w=0;e=11;break}x=c[J>>2]|0}e=qp(A)|0;if((e|0)!=0){z=e;w=e;e=15;break}y=0;Ia(4);if(!y){z=0;w=0;e=15}else{y=0;w=0;e=11}}else{x=0;w=0;e=15}}while(0);do{if((e|0)==15){y=0;qa(84,I|0,j|0);if(y){y=0;e=11;break}B=I|0;M=c[B>>2]|0;if((c[7716]|0)==-1){e=18}else{c[L>>2]=30864;c[L+4>>2]=18;c[L+8>>2]=0;y=0;Ha(4,30864,L|0,114);if(!y){e=18}else{y=0;e=45}}b:do{if((e|0)==18){N=(c[7717]|0)-1|0;L=c[M+8>>2]|0;do{if((c[M+12>>2]|0)-L>>2>>>0>N>>>0){L=c[L+(N<<2)>>2]|0;if((L|0)==0){break}E=L;M=c[J>>2]|0;N=M+A|0;L=c[(c[L>>2]|0)+32>>2]|0;y=0,Ka(L|0,E|0,M|0,N|0,z|0)|0;if(y){y=0;e=45;break b}if((A|0)==0){J=0}else{J=(a[c[J>>2]|0]|0)==45}c[G>>2]=0;Pp(K|0,0,12)|0;Pp(C|0,0,12)|0;Pp(D|0,0,12)|0;y=0;Ca(8,g|0,J|0,I|0,s|0,r|0,p|0,o|0,m|0,n|0,F|0);c:do{if(!y){G=H|0;g=c[F>>2]|0;if((A|0)>(g|0)){D=d[D]|0;if((D&1|0)==0){D=D>>>1}else{D=c[n+4>>2]|0}C=d[C]|0;if((C&1|0)==0){C=C>>>1}else{C=c[m+4>>2]|0}C=(A-g<<1|1)+D+C|0}else{D=d[D]|0;if((D&1|0)==0){D=D>>>1}else{D=c[n+4>>2]|0}C=d[C]|0;if((C&1|0)==0){C=C>>>1}else{C=c[m+4>>2]|0}C=D+2+C|0}C=C+g|0;do{if(C>>>0>100>>>0){C=qp(C)|0;if((C|0)!=0){G=C;break}y=0;Ia(4);if(!y){G=0;C=0;break}else{y=0}E=Mb(-1,-1)|0;break c}else{C=0}}while(0);y=0;ua(4,G|0,u|0,t|0,c[j+4>>2]|0,z|0,z+A|0,E|0,J|0,s|0,a[r]|0,a[p]|0,o|0,m|0,n|0,g|0);do{if(!y){c[v>>2]=c[f>>2];y=0;za(46,b|0,v|0,G|0,c[u>>2]|0,c[t>>2]|0,j|0,k|0);if(y){y=0;break}if((C|0)!=0){rp(C)}Yg(n);Yg(m);Yg(o);xg(c[B>>2]|0)|0;if((w|0)!=0){rp(w)}if((x|0)==0){i=q;return}rp(x);i=q;return}else{y=0}}while(0);E=Mb(-1,-1)|0;if((C|0)==0){break}rp(C)}else{y=0;E=Mb(-1,-1)|0;}}while(0);Yg(n);Yg(m);Yg(o);break b}}while(0);N=lc(4)|0;Xo(N);y=0;Ha(16,N|0,25592,150);if(y){y=0;e=45;break}}}while(0);if((e|0)==45){E=Mb(-1,-1)|0;}xg(c[B>>2]|0)|0}}while(0);if((e|0)==11){E=Mb(-1,-1)|0;e=12}if((e|0)==12){}if((w|0)!=0){rp(w)}if((x|0)==0){N=E;db(N|0)}rp(x);N=E;db(N|0)}function bm(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;n=i;i=i+40|0;P=n|0;O=n+16|0;K=n+32|0;I=K;x=i;i=i+12|0;i=i+7&-8;E=x;G=i;i=i+4|0;i=i+7&-8;L=G;B=i;i=i+12|0;i=i+7&-8;w=B;s=i;i=i+12|0;i=i+7&-8;v=s;p=i;i=i+12|0;i=i+7&-8;o=p;H=i;i=i+4|0;i=i+7&-8;J=H;A=i;i=i+12|0;i=i+7&-8;z=A;M=i;i=i+4|0;i=i+7&-8;N=M;C=i;i=i+12|0;i=i+7&-8;F=C;u=i;i=i+12|0;i=i+7&-8;t=u;q=i;i=i+12|0;i=i+7&-8;r=q;e=c[e>>2]|0;if(b){if((c[7834]|0)!=-1){c[O>>2]=31336;c[O+4>>2]=18;c[O+8>>2]=0;Sg(31336,O,114)}q=(c[7835]|0)-1|0;r=c[e+8>>2]|0;if((c[e+12>>2]|0)-r>>2>>>0<=q>>>0){b=lc(4)|0;P=b;Xo(P);Hb(b|0,25592,150)}q=c[r+(q<<2)>>2]|0;if((q|0)==0){b=lc(4)|0;P=b;Xo(P);Hb(b|0,25592,150)}r=q;t=c[q>>2]|0;do{if(d){zc[c[t+44>>2]&127](I,r);D=c[K>>2]|0;a[f]=D;D=D>>8;a[f+1|0]=D;D=D>>8;a[f+2|0]=D;D=D>>8;a[f+3|0]=D;zc[c[(c[q>>2]|0)+32>>2]&127](x,r);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}y=0;qa(6,l|0,0);if(!y){c[f>>2]=c[E>>2];c[f+4>>2]=c[E+4>>2];c[f+8>>2]=c[E+8>>2];Pp(E|0,0,12)|0;Yg(x);break}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}else{zc[c[t+40>>2]&127](L,r);D=c[G>>2]|0;a[f]=D;D=D>>8;a[f+1|0]=D;D=D>>8;a[f+2|0]=D;D=D>>8;a[f+3|0]=D;zc[c[(c[q>>2]|0)+28>>2]&127](B,r);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}y=0;qa(6,l|0,0);if(!y){c[f>>2]=c[w>>2];c[f+4>>2]=c[w+4>>2];c[f+8>>2]=c[w+8>>2];Pp(w|0,0,12)|0;Yg(B);break}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}}while(0);l=q;a[g]=Ac[c[(c[l>>2]|0)+12>>2]&255](r)|0;a[h]=Ac[c[(c[l>>2]|0)+16>>2]&255](r)|0;h=q;zc[c[(c[h>>2]|0)+20>>2]&127](s,r);l=j;if((a[l]&1)==0){a[j+1|0]=0;a[l]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}y=0;qa(6,j|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[l>>2]=c[v>>2];c[l+4>>2]=c[v+4>>2];c[l+8>>2]=c[v+8>>2];Pp(v|0,0,12)|0;Yg(s);zc[c[(c[h>>2]|0)+24>>2]&127](p,r);j=k;if((a[j]&1)==0){a[k+1|0]=0;a[j]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}y=0;qa(6,k|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[j>>2]=c[o>>2];c[j+4>>2]=c[o+4>>2];c[j+8>>2]=c[o+8>>2];Pp(o|0,0,12)|0;Yg(p);b=Ac[c[(c[q>>2]|0)+36>>2]&255](r)|0;c[m>>2]=b;i=n;return}else{if((c[7836]|0)!=-1){c[P>>2]=31344;c[P+4>>2]=18;c[P+8>>2]=0;Sg(31344,P,114)}o=(c[7837]|0)-1|0;p=c[e+8>>2]|0;if((c[e+12>>2]|0)-p>>2>>>0<=o>>>0){b=lc(4)|0;P=b;Xo(P);Hb(b|0,25592,150)}p=c[p+(o<<2)>>2]|0;if((p|0)==0){b=lc(4)|0;P=b;Xo(P);Hb(b|0,25592,150)}o=p;s=c[p>>2]|0;do{if(d){zc[c[s+44>>2]&127](J,o);D=c[H>>2]|0;a[f]=D;D=D>>8;a[f+1|0]=D;D=D>>8;a[f+2|0]=D;D=D>>8;a[f+3|0]=D;zc[c[(c[p>>2]|0)+32>>2]&127](A,o);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}y=0;qa(6,l|0,0);if(!y){c[f>>2]=c[z>>2];c[f+4>>2]=c[z+4>>2];c[f+8>>2]=c[z+8>>2];Pp(z|0,0,12)|0;Yg(A);break}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}else{zc[c[s+40>>2]&127](N,o);D=c[M>>2]|0;a[f]=D;D=D>>8;a[f+1|0]=D;D=D>>8;a[f+2|0]=D;D=D>>8;a[f+3|0]=D;zc[c[(c[p>>2]|0)+28>>2]&127](C,o);f=l;if((a[f]&1)==0){a[l+1|0]=0;a[f]=0}else{a[c[l+8>>2]|0]=0;c[l+4>>2]=0}y=0;qa(6,l|0,0);if(!y){c[f>>2]=c[F>>2];c[f+4>>2]=c[F+4>>2];c[f+8>>2]=c[F+8>>2];Pp(F|0,0,12)|0;Yg(C);break}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}}while(0);l=p;a[g]=Ac[c[(c[l>>2]|0)+12>>2]&255](o)|0;a[h]=Ac[c[(c[l>>2]|0)+16>>2]&255](o)|0;h=p;zc[c[(c[h>>2]|0)+20>>2]&127](u,o);l=j;if((a[l]&1)==0){a[j+1|0]=0;a[l]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}y=0;qa(6,j|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[l>>2]=c[t>>2];c[l+4>>2]=c[t+4>>2];c[l+8>>2]=c[t+8>>2];Pp(t|0,0,12)|0;Yg(u);zc[c[(c[h>>2]|0)+24>>2]&127](q,o);j=k;if((a[j]&1)==0){a[k+1|0]=0;a[j]=0}else{a[c[k+8>>2]|0]=0;c[k+4>>2]=0}y=0;qa(6,k|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[j>>2]=c[r>>2];c[j+4>>2]=c[r+4>>2];c[j+8>>2]=c[r+8>>2];Pp(r|0,0,12)|0;Yg(q);b=Ac[c[(c[p>>2]|0)+36>>2]&255](o)|0;c[m>>2]=b;i=n;return}}function cm(d,e,f,g,h,i,j,k,l,m,n,o,p,q,r){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;c[f>>2]=d;u=j;w=q;s=q+1|0;t=q+8|0;q=q+4|0;A=p;y=(g&512|0)==0;z=p+1|0;x=p+4|0;B=p+8|0;C=(r|0)>0;p=o;E=o+1|0;D=o+8|0;G=o+4|0;o=j+8|0;F=-r|0;H=0;do{a:do{switch(a[l+H|0]|0){case 0:{c[e>>2]=c[f>>2];break};case 3:{I=a[w]|0;J=I&255;if((J&1|0)==0){J=J>>>1}else{J=c[q>>2]|0}if((J|0)==0){break a}if((I&1)==0){I=s}else{I=c[t>>2]|0}N=a[I]|0;O=c[f>>2]|0;c[f>>2]=O+1;a[O]=N;break};case 1:{c[e>>2]=c[f>>2];N=Mc[c[(c[u>>2]|0)+28>>2]&63](j,32)|0;O=c[f>>2]|0;c[f>>2]=O+1;a[O]=N;break};case 4:{I=c[f>>2]|0;h=k?h+1|0:h;b:do{if(h>>>0<i>>>0){J=h;while(1){L=a[J]|0;if(L<<24>>24<=-1){break b}K=J+1|0;if((b[(c[o>>2]|0)+(L<<24>>24<<1)>>1]&2048)==0){break b}if(K>>>0<i>>>0){J=K}else{J=K;break}}}else{J=h}}while(0);K=J;if(C){if(J>>>0>h>>>0){K=h+(-K|0)|0;K=K>>>0<F>>>0?F:K;L=K+r|0;M=J;O=r;N=I;while(1){M=M-1|0;P=a[M]|0;c[f>>2]=N+1;a[N]=P;O=O-1|0;N=(O|0)>0;if(!(M>>>0>h>>>0&N)){break}N=c[f>>2]|0}J=J+K|0;if(N){v=34}else{K=0}}else{L=r;v=34}if((v|0)==34){v=0;K=Mc[c[(c[u>>2]|0)+28>>2]&63](j,48)|0}M=c[f>>2]|0;c[f>>2]=M+1;if((L|0)>0){do{a[M]=K;L=L-1|0;M=c[f>>2]|0;c[f>>2]=M+1}while((L|0)>0)}a[M]=m}if((J|0)==(h|0)){O=Mc[c[(c[u>>2]|0)+28>>2]&63](j,48)|0;P=c[f>>2]|0;c[f>>2]=P+1;a[P]=O}else{K=a[p]|0;L=K&255;if((L&1|0)==0){L=L>>>1}else{L=c[G>>2]|0}if((L|0)==0){M=0;K=0;L=-1}else{if((K&1)==0){L=E}else{L=c[D>>2]|0}M=0;K=0;L=a[L]|0}while(1){do{if((M|0)==(L|0)){M=c[f>>2]|0;c[f>>2]=M+1;a[M]=n;K=K+1|0;M=a[p]|0;N=M&255;if((N&1|0)==0){N=N>>>1}else{N=c[G>>2]|0}if(K>>>0>=N>>>0){M=0;break}M=(M&1)==0;if(M){L=E}else{L=c[D>>2]|0}if((a[L+K|0]|0)==127){L=-1;M=0;break}if(M){L=E}else{L=c[D>>2]|0}L=a[L+K|0]|0;M=0}}while(0);J=J-1|0;O=a[J]|0;P=c[f>>2]|0;c[f>>2]=P+1;a[P]=O;if((J|0)==(h|0)){break}else{M=M+1|0}}}J=c[f>>2]|0;if((I|0)==(J|0)){break a}J=J-1|0;if(I>>>0>=J>>>0){break a}do{P=a[I]|0;a[I]=a[J]|0;a[J]=P;I=I+1|0;J=J-1|0;}while(I>>>0<J>>>0);break};case 2:{L=a[A]|0;I=L&255;K=(I&1|0)==0;if(K){J=I>>>1}else{J=c[x>>2]|0}if((J|0)==0|y){break a}if((L&1)==0){L=z;J=z}else{J=c[B>>2]|0;L=J}if(K){I=I>>>1}else{I=c[x>>2]|0}I=L+I|0;K=c[f>>2]|0;if((J|0)!=(I|0)){do{a[K]=a[J]|0;J=J+1|0;K=K+1|0;}while((J|0)!=(I|0))}c[f>>2]=K;break};default:{}}}while(0);H=H+1|0;}while(H>>>0<4>>>0);k=a[w]|0;l=k&255;u=(l&1|0)==0;if(u){i=l>>>1}else{i=c[q>>2]|0}if(i>>>0>1>>>0){if((k&1)==0){t=s}else{s=c[t>>2]|0;t=s}if(u){q=l>>>1}else{q=c[q>>2]|0}q=t+q|0;t=c[f>>2]|0;u=s+1|0;if((u|0)==(q|0)){s=t}else{s=t;do{a[s]=a[u]|0;s=s+1|0;u=u+1|0;}while((u|0)!=(q|0))}c[f>>2]=s}g=g&176;if((g|0)==16){return}else if((g|0)==32){c[e>>2]=c[f>>2];return}else{c[e>>2]=d;return}}function dm(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;r=i;i=i+32|0;x=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[x>>2];x=r|0;F=r+16|0;E=r+24|0;o=E;s=i;i=i+1|0;i=i+7&-8;t=i;i=i+1|0;i=i+7&-8;e=i;i=i+12|0;i=i+7&-8;G=e;l=i;i=i+12|0;i=i+7&-8;A=l;m=i;i=i+12|0;i=i+7&-8;C=m;B=i;i=i+4|0;i=i+7&-8;D=i;i=i+100|0;i=i+7&-8;q=i;i=i+4|0;i=i+7&-8;p=i;i=i+4|0;i=i+7&-8;u=i;i=i+4|0;i=i+7&-8;sh(F,h);n=F|0;v=c[n>>2]|0;if((c[7716]|0)==-1){w=3}else{c[x>>2]=30864;c[x+4>>2]=18;c[x+8>>2]=0;y=0;Ha(4,30864,x|0,114);if(!y){w=3}else{y=0}}a:do{if((w|0)==3){w=(c[7717]|0)-1|0;x=c[v+8>>2]|0;do{if((c[v+12>>2]|0)-x>>2>>>0>w>>>0){z=c[x+(w<<2)>>2]|0;if((z|0)==0){break}v=z;w=k;x=k;H=a[x]|0;I=H&255;if((I&1|0)==0){I=I>>>1}else{I=c[k+4>>2]|0}if((I|0)==0){z=0}else{if((H&1)==0){H=w+1|0}else{H=c[k+8>>2]|0}H=a[H]|0;z=(y=0,Da(c[(c[z>>2]|0)+28>>2]|0,v|0,45)|0);if(y){y=0;break a}z=H<<24>>24==z<<24>>24}c[E>>2]=0;Pp(G|0,0,12)|0;Pp(A|0,0,12)|0;Pp(C|0,0,12)|0;y=0;Ca(8,g|0,z|0,F|0,o|0,s|0,t|0,e|0,l|0,m|0,B|0);b:do{if(!y){D=D|0;g=a[x]|0;E=g&255;G=(E&1|0)==0;if(G){F=E>>>1}else{F=c[k+4>>2]|0}B=c[B>>2]|0;if((F|0)>(B|0)){if(G){E=E>>>1}else{E=c[k+4>>2]|0}C=d[C]|0;if((C&1|0)==0){C=C>>>1}else{C=c[m+4>>2]|0}A=d[A]|0;if((A&1|0)==0){A=A>>>1}else{A=c[l+4>>2]|0}A=(E-B<<1|1)+C+A|0}else{C=d[C]|0;if((C&1|0)==0){C=C>>>1}else{C=c[m+4>>2]|0}A=d[A]|0;if((A&1|0)==0){A=A>>>1}else{A=c[l+4>>2]|0}A=C+2+A|0}A=A+B|0;do{if(A>>>0>100>>>0){A=qp(A)|0;if((A|0)!=0){D=A;break}y=0;Ia(4);if(!y){D=0;A=0;g=a[x]|0;break}else{y=0;h=Mb(-1,-1)|0;break b}}else{A=0}}while(0);if((g&1)==0){x=w+1|0;w=w+1|0}else{w=c[k+8>>2]|0;x=w}C=g&255;if((C&1|0)==0){k=C>>>1}else{k=c[k+4>>2]|0}y=0;ua(4,D|0,q|0,p|0,c[h+4>>2]|0,w|0,x+k|0,v|0,z|0,o|0,a[s]|0,a[t]|0,e|0,l|0,m|0,B|0);do{if(!y){c[u>>2]=c[f>>2];y=0;za(46,b|0,u|0,D|0,c[q>>2]|0,c[p>>2]|0,h|0,j|0);if(y){y=0;break}if((A|0)==0){Yg(m);Yg(l);Yg(e);I=c[n>>2]|0;I=I|0;xg(I)|0;i=r;return}rp(A);Yg(m);Yg(l);Yg(e);I=c[n>>2]|0;I=I|0;xg(I)|0;i=r;return}else{y=0}}while(0);h=Mb(-1,-1)|0;if((A|0)==0){break}rp(A)}else{y=0;h=Mb(-1,-1)|0;}}while(0);Yg(m);Yg(l);Yg(e);I=h;H=c[n>>2]|0;H=H|0;xg(H)|0;db(I|0)}}while(0);I=lc(4)|0;Xo(I);y=0;Ha(16,I|0,25592,150);if(y){y=0;break}}}while(0);I=Mb(-1,-1)|0;H=c[n>>2]|0;H=H|0;xg(H)|0;db(I|0)}function em(a){a=a|0;vg(a|0);xp(a);return}function fm(a){a=a|0;vg(a|0);return}function gm(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;u=i;i=i+544|0;L=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[L>>2];L=u|0;J=u+120|0;I=u+528|0;H=u+536|0;v=H;q=i;i=i+4|0;i=i+7&-8;r=i;i=i+4|0;i=i+7&-8;o=i;i=i+12|0;i=i+7&-8;K=o;m=i;i=i+12|0;i=i+7&-8;C=m;n=i;i=i+12|0;i=i+7&-8;E=n;F=i;i=i+4|0;i=i+7&-8;G=i;i=i+400|0;s=i;i=i+4|0;i=i+7&-8;p=i;i=i+4|0;i=i+7&-8;t=i;i=i+4|0;i=i+7&-8;N=u+16|0;c[J>>2]=N;z=u+128|0;B=gb(N|0,100,16760,(N=i,i=i+8|0,h[N>>3]=l,N)|0)|0;i=N;a:do{if(B>>>0>99>>>0){do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}e=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=e;break}else{y=0;D=Mb(-1,-1)|0;x=0;w=0;e=12;break a}}}while(0);B=(y=0,Ka(4,J|0,c[7330]|0,16760,(N=i,i=i+8|0,h[N>>3]=l,N)|0)|0);i=N;if(y){y=0;x=0;w=0;e=11;break}x=c[J>>2]|0;if((x|0)==0){y=0;Ia(4);if(y){y=0;x=0;w=0;e=11;break}x=c[J>>2]|0}N=qp(B<<2)|0;w=N;if((N|0)!=0){z=w;e=15;break}y=0;Ia(4);if(!y){z=w;e=15}else{y=0;e=11}}else{x=0;w=0;e=15}}while(0);do{if((e|0)==15){y=0;qa(84,I|0,j|0);if(y){y=0;e=11;break}A=I|0;M=c[A>>2]|0;if((c[7714]|0)==-1){e=18}else{c[L>>2]=30856;c[L+4>>2]=18;c[L+8>>2]=0;y=0;Ha(4,30856,L|0,114);if(!y){e=18}else{y=0;e=44}}b:do{if((e|0)==18){L=(c[7715]|0)-1|0;N=c[M+8>>2]|0;do{if((c[M+12>>2]|0)-N>>2>>>0>L>>>0){L=c[N+(L<<2)>>2]|0;if((L|0)==0){break}D=L;M=c[J>>2]|0;N=M+B|0;L=c[(c[L>>2]|0)+48>>2]|0;y=0,Ka(L|0,D|0,M|0,N|0,z|0)|0;if(y){y=0;e=44;break b}if((B|0)==0){J=0}else{J=(a[c[J>>2]|0]|0)==45}c[H>>2]=0;Pp(K|0,0,12)|0;Pp(C|0,0,12)|0;Pp(E|0,0,12)|0;y=0;Ca(6,g|0,J|0,I|0,v|0,q|0,r|0,o|0,m|0,n|0,F|0);do{if(!y){G=G|0;g=c[F>>2]|0;if((B|0)>(g|0)){E=d[E]|0;if((E&1|0)==0){E=E>>>1}else{E=c[n+4>>2]|0}C=d[C]|0;if((C&1|0)==0){C=C>>>1}else{C=c[m+4>>2]|0}C=(B-g<<1|1)+E+C|0}else{E=d[E]|0;if((E&1|0)==0){E=E>>>1}else{E=c[n+4>>2]|0}C=d[C]|0;if((C&1|0)==0){C=C>>>1}else{C=c[m+4>>2]|0}C=E+2+C|0}C=C+g|0;do{if(C>>>0>100>>>0){N=qp(C<<2)|0;C=N;if((N|0)!=0){G=C;e=48;break}y=0;Ia(4);if(!y){G=C;e=48}else{y=0}}else{C=0;e=48}}while(0);do{if((e|0)==48){y=0;ua(2,G|0,s|0,p|0,c[j+4>>2]|0,z|0,z+(B<<2)|0,D|0,J|0,v|0,c[q>>2]|0,c[r>>2]|0,o|0,m|0,n|0,g|0);if(y){y=0;break}c[t>>2]=c[f>>2];y=0;za(38,b|0,t|0,G|0,c[s>>2]|0,c[p>>2]|0,j|0,k|0);if(y){y=0;break}if((C|0)!=0){rp(C)}jh(n);jh(m);Yg(o);xg(c[A>>2]|0)|0;if((w|0)!=0){rp(w)}if((x|0)==0){i=u;return}rp(x);i=u;return}}while(0);D=Mb(-1,-1)|0;if((C|0)==0){break}rp(C)}else{y=0;D=Mb(-1,-1)|0;}}while(0);jh(n);jh(m);Yg(o);break b}}while(0);N=lc(4)|0;Xo(N);y=0;Ha(16,N|0,25592,150);if(y){y=0;e=44;break}}}while(0);if((e|0)==44){D=Mb(-1,-1)|0;}xg(c[A>>2]|0)|0}}while(0);if((e|0)==11){D=Mb(-1,-1)|0;e=12}if((e|0)==12){}if((w|0)!=0){rp(w)}if((x|0)==0){N=D;db(N|0)}rp(x);N=D;db(N|0)}function hm(b,d,e,f,g,h,j,k,l,m){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0;n=i;i=i+40|0;P=n|0;O=n+16|0;K=n+32|0;I=K;x=i;i=i+12|0;i=i+7&-8;E=x;G=i;i=i+4|0;i=i+7&-8;L=G;B=i;i=i+12|0;i=i+7&-8;w=B;s=i;i=i+12|0;i=i+7&-8;v=s;p=i;i=i+12|0;i=i+7&-8;o=p;H=i;i=i+4|0;i=i+7&-8;J=H;A=i;i=i+12|0;i=i+7&-8;z=A;M=i;i=i+4|0;i=i+7&-8;N=M;C=i;i=i+12|0;i=i+7&-8;F=C;u=i;i=i+12|0;i=i+7&-8;t=u;q=i;i=i+12|0;i=i+7&-8;r=q;e=c[e>>2]|0;if(b){if((c[7830]|0)!=-1){c[O>>2]=31320;c[O+4>>2]=18;c[O+8>>2]=0;Sg(31320,O,114)}r=(c[7831]|0)-1|0;q=c[e+8>>2]|0;if((c[e+12>>2]|0)-q>>2>>>0<=r>>>0){b=lc(4)|0;P=b;Xo(P);Hb(b|0,25592,150)}r=c[q+(r<<2)>>2]|0;if((r|0)==0){b=lc(4)|0;P=b;Xo(P);Hb(b|0,25592,150)}q=r;t=c[r>>2]|0;do{if(d){zc[c[t+44>>2]&127](I,q);D=c[K>>2]|0;a[f]=D;D=D>>8;a[f+1|0]=D;D=D>>8;a[f+2|0]=D;D=D>>8;a[f+3|0]=D;zc[c[(c[r>>2]|0)+32>>2]&127](x,q);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}y=0;qa(64,l|0,0);if(!y){c[f>>2]=c[E>>2];c[f+4>>2]=c[E+4>>2];c[f+8>>2]=c[E+8>>2];Pp(E|0,0,12)|0;jh(x);break}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}else{zc[c[t+40>>2]&127](L,q);D=c[G>>2]|0;a[f]=D;D=D>>8;a[f+1|0]=D;D=D>>8;a[f+2|0]=D;D=D>>8;a[f+3|0]=D;zc[c[(c[r>>2]|0)+28>>2]&127](B,q);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}y=0;qa(64,l|0,0);if(!y){c[f>>2]=c[w>>2];c[f+4>>2]=c[w+4>>2];c[f+8>>2]=c[w+8>>2];Pp(w|0,0,12)|0;jh(B);break}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}}while(0);l=r;c[g>>2]=Ac[c[(c[l>>2]|0)+12>>2]&255](q)|0;c[h>>2]=Ac[c[(c[l>>2]|0)+16>>2]&255](q)|0;zc[c[(c[r>>2]|0)+20>>2]&127](s,q);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}y=0;qa(6,j|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[h>>2]=c[v>>2];c[h+4>>2]=c[v+4>>2];c[h+8>>2]=c[v+8>>2];Pp(v|0,0,12)|0;Yg(s);zc[c[(c[r>>2]|0)+24>>2]&127](p,q);j=k;if((a[j]&1)==0){c[k+4>>2]=0;a[j]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}y=0;qa(64,k|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[j>>2]=c[o>>2];c[j+4>>2]=c[o+4>>2];c[j+8>>2]=c[o+8>>2];Pp(o|0,0,12)|0;jh(p);b=Ac[c[(c[l>>2]|0)+36>>2]&255](q)|0;c[m>>2]=b;i=n;return}else{if((c[7832]|0)!=-1){c[P>>2]=31328;c[P+4>>2]=18;c[P+8>>2]=0;Sg(31328,P,114)}o=(c[7833]|0)-1|0;p=c[e+8>>2]|0;if((c[e+12>>2]|0)-p>>2>>>0<=o>>>0){b=lc(4)|0;P=b;Xo(P);Hb(b|0,25592,150)}p=c[p+(o<<2)>>2]|0;if((p|0)==0){b=lc(4)|0;P=b;Xo(P);Hb(b|0,25592,150)}o=p;s=c[p>>2]|0;do{if(d){zc[c[s+44>>2]&127](J,o);D=c[H>>2]|0;a[f]=D;D=D>>8;a[f+1|0]=D;D=D>>8;a[f+2|0]=D;D=D>>8;a[f+3|0]=D;zc[c[(c[p>>2]|0)+32>>2]&127](A,o);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}y=0;qa(64,l|0,0);if(!y){c[f>>2]=c[z>>2];c[f+4>>2]=c[z+4>>2];c[f+8>>2]=c[z+8>>2];Pp(z|0,0,12)|0;jh(A);break}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}else{zc[c[s+40>>2]&127](N,o);D=c[M>>2]|0;a[f]=D;D=D>>8;a[f+1|0]=D;D=D>>8;a[f+2|0]=D;D=D>>8;a[f+3|0]=D;zc[c[(c[p>>2]|0)+28>>2]&127](C,o);f=l;if((a[f]&1)==0){c[l+4>>2]=0;a[f]=0}else{c[c[l+8>>2]>>2]=0;c[l+4>>2]=0}y=0;qa(64,l|0,0);if(!y){c[f>>2]=c[F>>2];c[f+4>>2]=c[F+4>>2];c[f+8>>2]=c[F+8>>2];Pp(F|0,0,12)|0;jh(C);break}else{y=0;b=Mb(-1,-1,0)|0;nd(b)}}}while(0);l=p;c[g>>2]=Ac[c[(c[l>>2]|0)+12>>2]&255](o)|0;c[h>>2]=Ac[c[(c[l>>2]|0)+16>>2]&255](o)|0;zc[c[(c[p>>2]|0)+20>>2]&127](u,o);h=j;if((a[h]&1)==0){a[j+1|0]=0;a[h]=0}else{a[c[j+8>>2]|0]=0;c[j+4>>2]=0}y=0;qa(6,j|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[h>>2]=c[t>>2];c[h+4>>2]=c[t+4>>2];c[h+8>>2]=c[t+8>>2];Pp(t|0,0,12)|0;Yg(u);zc[c[(c[p>>2]|0)+24>>2]&127](q,o);j=k;if((a[j]&1)==0){c[k+4>>2]=0;a[j]=0}else{c[c[k+8>>2]>>2]=0;c[k+4>>2]=0}y=0;qa(64,k|0,0);if(y){y=0;b=Mb(-1,-1,0)|0;nd(b)}c[j>>2]=c[r>>2];c[j+4>>2]=c[r+4>>2];c[j+8>>2]=c[r+8>>2];Pp(r|0,0,12)|0;jh(q);b=Ac[c[(c[l>>2]|0)+36>>2]&255](o)|0;c[m>>2]=b;i=n;return}}function im(b,d,e,f,g,h,i,j,k,l,m,n,o,p,q){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;var r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;c[e>>2]=b;u=i;s=p;r=p+4|0;p=p+8|0;w=o;x=(f&512|0)==0;v=o+4|0;o=o+8|0;y=(q|0)>0;B=n;A=n+1|0;z=n+8|0;n=n+4|0;C=i;D=0;do{a:do{switch(a[k+D|0]|0){case 2:{H=a[w]|0;F=H&255;E=(F&1|0)==0;if(E){G=F>>>1}else{G=c[v>>2]|0}if((G|0)==0|x){break a}if((H&1)==0){H=v;G=v;I=v}else{I=c[o>>2]|0;H=I;G=I}if(E){J=F>>>1}else{J=c[v>>2]|0}E=H+(J<<2)|0;F=c[e>>2]|0;if((G|0)!=(E|0)){H=(H+(J-1<<2)+(-I|0)|0)>>>2;I=F;while(1){c[I>>2]=c[G>>2];G=G+4|0;if((G|0)==(E|0)){break}I=I+4|0}F=F+(H+1<<2)|0}c[e>>2]=F;break};case 3:{E=a[s]|0;F=E&255;if((F&1|0)==0){F=F>>>1}else{F=c[r>>2]|0}if((F|0)==0){break a}if((E&1)==0){E=r}else{E=c[p>>2]|0}I=c[E>>2]|0;J=c[e>>2]|0;c[e>>2]=J+4;c[J>>2]=I;break};case 0:{c[d>>2]=c[e>>2];break};case 1:{c[d>>2]=c[e>>2];I=Mc[c[(c[u>>2]|0)+44>>2]&63](i,32)|0;J=c[e>>2]|0;c[e>>2]=J+4;c[J>>2]=I;break};case 4:{E=c[e>>2]|0;g=j?g+4|0:g;b:do{if(g>>>0<h>>>0){F=g;while(1){G=F+4|0;if(!(Cc[c[(c[C>>2]|0)+12>>2]&127](i,2048,c[F>>2]|0)|0)){break b}if(G>>>0<h>>>0){F=G}else{F=G;break}}}else{F=g}}while(0);if(y){if(F>>>0>g>>>0){H=q;do{F=F-4|0;J=c[F>>2]|0;G=c[e>>2]|0;c[e>>2]=G+4;c[G>>2]=J;H=H-1|0;G=(H|0)>0;}while(F>>>0>g>>>0&G);if(G){t=35}else{G=0}}else{H=q;t=35}if((t|0)==35){t=0;G=Mc[c[(c[u>>2]|0)+44>>2]&63](i,48)|0}I=c[e>>2]|0;c[e>>2]=I+4;if((H|0)>0){do{c[I>>2]=G;H=H-1|0;I=c[e>>2]|0;c[e>>2]=I+4}while((H|0)>0)}c[I>>2]=l}if((F|0)==(g|0)){I=Mc[c[(c[u>>2]|0)+44>>2]&63](i,48)|0;J=c[e>>2]|0;c[e>>2]=J+4;c[J>>2]=I}else{G=a[B]|0;H=G&255;if((H&1|0)==0){H=H>>>1}else{H=c[n>>2]|0}if((H|0)==0){I=0;G=0;H=-1}else{if((G&1)==0){H=A}else{H=c[z>>2]|0}I=0;G=0;H=a[H]|0}while(1){do{if((I|0)==(H|0)){I=c[e>>2]|0;c[e>>2]=I+4;c[I>>2]=m;G=G+1|0;I=a[B]|0;J=I&255;if((J&1|0)==0){J=J>>>1}else{J=c[n>>2]|0}if(G>>>0>=J>>>0){I=0;break}I=(I&1)==0;if(I){H=A}else{H=c[z>>2]|0}if((a[H+G|0]|0)==127){H=-1;I=0;break}if(I){H=A}else{H=c[z>>2]|0}H=a[H+G|0]|0;I=0}}while(0);F=F-4|0;K=c[F>>2]|0;J=c[e>>2]|0;c[e>>2]=J+4;c[J>>2]=K;if((F|0)==(g|0)){break}else{I=I+1|0}}}F=c[e>>2]|0;if((E|0)==(F|0)){break a}F=F-4|0;if(E>>>0>=F>>>0){break a}do{K=c[E>>2]|0;c[E>>2]=c[F>>2];c[F>>2]=K;E=E+4|0;F=F-4|0;}while(E>>>0<F>>>0);break};default:{}}}while(0);D=D+1|0;}while(D>>>0<4>>>0);m=a[s]|0;s=m&255;j=(s&1|0)==0;if(j){l=s>>>1}else{l=c[r>>2]|0}if(l>>>0>1>>>0){if((m&1)==0){l=r;k=r;m=r}else{m=c[p>>2]|0;l=m;k=m}if(j){j=s>>>1}else{j=c[r>>2]|0}r=l+(j<<2)|0;p=c[e>>2]|0;k=k+4|0;if((k|0)!=(r|0)){l=((l+(j-2<<2)+(-m|0)|0)>>>2)+1|0;m=p;while(1){c[m>>2]=c[k>>2];k=k+4|0;if((k|0)==(r|0)){break}else{m=m+4|0}}p=p+(l<<2)|0}c[e>>2]=p}f=f&176;if((f|0)==32){c[d>>2]=c[e>>2];return}else if((f|0)==16){return}else{c[d>>2]=b;return}}function jm(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;r=i;i=i+32|0;x=f;f=i;i=i+4|0;i=i+7&-8;c[f>>2]=c[x>>2];x=r|0;D=r+16|0;E=r+24|0;u=E;p=i;i=i+4|0;i=i+7&-8;q=i;i=i+4|0;i=i+7&-8;e=i;i=i+12|0;i=i+7&-8;G=e;m=i;i=i+12|0;i=i+7&-8;A=m;n=i;i=i+12|0;i=i+7&-8;C=n;B=i;i=i+4|0;i=i+7&-8;F=i;i=i+400|0;t=i;i=i+4|0;i=i+7&-8;o=i;i=i+4|0;i=i+7&-8;s=i;i=i+4|0;i=i+7&-8;sh(D,h);l=D|0;w=c[l>>2]|0;if((c[7714]|0)==-1){v=3}else{c[x>>2]=30856;c[x+4>>2]=18;c[x+8>>2]=0;y=0;Ha(4,30856,x|0,114);if(!y){v=3}else{y=0}}a:do{if((v|0)==3){x=(c[7715]|0)-1|0;z=c[w+8>>2]|0;do{if((c[w+12>>2]|0)-z>>2>>>0>x>>>0){z=c[z+(x<<2)>>2]|0;if((z|0)==0){break}w=z;x=k;H=a[x]|0;I=H&255;if((I&1|0)==0){I=I>>>1}else{I=c[k+4>>2]|0}if((I|0)==0){z=0}else{if((H&1)==0){H=k+4|0}else{H=c[k+8>>2]|0}H=c[H>>2]|0;z=(y=0,Da(c[(c[z>>2]|0)+44>>2]|0,w|0,45)|0);if(y){y=0;break a}z=(H|0)==(z|0)}c[E>>2]=0;Pp(G|0,0,12)|0;Pp(A|0,0,12)|0;Pp(C|0,0,12)|0;y=0;Ca(6,g|0,z|0,D|0,u|0,p|0,q|0,e|0,m|0,n|0,B|0);do{if(!y){D=F|0;g=a[x]|0;E=g&255;F=(E&1|0)==0;if(F){G=E>>>1}else{G=c[k+4>>2]|0}B=c[B>>2]|0;if((G|0)>(B|0)){if(F){E=E>>>1}else{E=c[k+4>>2]|0}C=d[C]|0;if((C&1|0)==0){C=C>>>1}else{C=c[n+4>>2]|0}A=d[A]|0;if((A&1|0)==0){A=A>>>1}else{A=c[m+4>>2]|0}A=(E-B<<1|1)+C+A|0}else{C=d[C]|0;if((C&1|0)==0){C=C>>>1}else{C=c[n+4>>2]|0}A=d[A]|0;if((A&1|0)==0){A=A>>>1}else{A=c[m+4>>2]|0}A=C+2+A|0}A=A+B|0;do{if(A>>>0>100>>>0){I=qp(A<<2)|0;A=I;if((I|0)!=0){D=A;v=46;break}y=0;Ia(4);if(y){y=0;break}D=A;g=a[x]|0;v=46}else{A=0;v=46}}while(0);do{if((v|0)==46){if((g&1)==0){x=k+4|0;v=k+4|0}else{v=c[k+8>>2]|0;x=v}C=g&255;if((C&1|0)==0){k=C>>>1}else{k=c[k+4>>2]|0}y=0;ua(2,D|0,t|0,o|0,c[h+4>>2]|0,v|0,x+(k<<2)|0,w|0,z|0,u|0,c[p>>2]|0,c[q>>2]|0,e|0,m|0,n|0,B|0);if(y){y=0;break}c[s>>2]=c[f>>2];y=0;za(38,b|0,s|0,D|0,c[t>>2]|0,c[o>>2]|0,h|0,j|0);if(y){y=0;break}if((A|0)==0){jh(n);jh(m);Yg(e);I=c[l>>2]|0;I=I|0;xg(I)|0;i=r;return}rp(A);jh(n);jh(m);Yg(e);I=c[l>>2]|0;I=I|0;xg(I)|0;i=r;return}}while(0);h=Mb(-1,-1)|0;if((A|0)==0){break}rp(A)}else{y=0;h=Mb(-1,-1)|0;}}while(0);jh(n);jh(m);Yg(e);I=h;H=c[l>>2]|0;H=H|0;xg(H)|0;db(I|0)}}while(0);I=lc(4)|0;Xo(I);y=0;Ha(16,I|0,25592,150);if(y){y=0;break}}}while(0);I=Mb(-1,-1)|0;H=c[l>>2]|0;H=H|0;xg(H)|0;db(I|0)}function km(a){a=a|0;vg(a|0);xp(a);return}function lm(a){a=a|0;vg(a|0);return}function mm(b,d,e){b=b|0;d=d|0;e=e|0;if((a[d]&1)==0){d=d+1|0}else{d=c[d+8>>2]|0}e=oc(d|0,1)|0;return e>>>(((e|0)!=-1|0)>>>0)|0}function nm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;i=i+16|0;m=d|0;o=m;Pp(o|0,0,12)|0;n=b;p=h;r=a[h]|0;if((r&1)==0){q=p+1|0;p=p+1|0}else{p=c[h+8>>2]|0;q=p}r=r&255;if((r&1|0)==0){h=r>>>1}else{h=c[h+4>>2]|0}h=q+h|0;do{if(p>>>0<h>>>0){do{y=0;qa(104,m|0,a[p]|0);if(y){y=0;l=12;break}p=p+1|0;}while(p>>>0<h>>>0);if((l|0)==12){j=Mb(-1,-1)|0;break}l=(e|0)==-1?-1:e<<1;if((a[o]&1)==0){o=l;l=16;break}e=c[m+8>>2]|0;o=l;l=17}else{o=(e|0)==-1?-1:e<<1;l=16}}while(0);if((l|0)==16){e=m+1|0;l=17}do{if((l|0)==17){f=(y=0,Ka(12,o|0,f|0,g|0,e|0)|0);if(y){y=0;j=Mb(-1,-1)|0;break}Pp(n|0,0,12)|0;r=Mp(f|0)|0;n=f+r|0;if((r|0)<=0){Yg(m);i=d;return}while(1){y=0;qa(104,b|0,a[f]|0);if(y){y=0;break}f=f+1|0;if(f>>>0>=n>>>0){l=22;break}}if((l|0)==22){Yg(m);i=d;return}r=Mb(-1,-1)|0;Yg(b);Yg(m);db(r|0)}}while(0);r=j;Yg(m);db(r|0)}function om(a,b){a=a|0;b=b|0;Wb(((b|0)==-1?-1:b<<1)|0)|0;return}function pm(a){a=a|0;vg(a|0);xp(a);return}function qm(a){a=a|0;vg(a|0);return}function rm(b,d,e){b=b|0;d=d|0;e=e|0;if((a[d]&1)==0){d=d+1|0}else{d=c[d+8>>2]|0}e=oc(d|0,1)|0;return e>>>(((e|0)!=-1|0)>>>0)|0}function sm(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;o=i;i=i+224|0;D=o|0;F=o+8|0;z=o+40|0;A=o+48|0;r=o+56|0;q=o+64|0;m=o+192|0;p=o+200|0;l=o+208|0;v=l;u=i;i=i+8|0;d=i;i=i+8|0;Pp(v|0,0,12)|0;s=b;x=D;n=r;B=u|0;c[u+4>>2]=0;c[u>>2]=21312;G=a[h]|0;if((G&1)==0){C=h+4|0;E=h+4|0}else{E=c[h+8>>2]|0;C=E}G=G&255;if((G&1|0)==0){h=G>>>1}else{h=c[h+4>>2]|0}C=C+(h<<2)|0;c[D>>2]=0;c[D+4>>2]=0;a:do{if(E>>>0<C>>>0){D=u;h=F|0;F=F+32|0;G=21312;b:while(1){c[A>>2]=E;G=(y=0,Ja(c[G+12>>2]|0,B|0,x|0,E|0,C|0,A|0,h|0,F|0,z|0)|0);if(y){y=0;w=24;break}H=c[A>>2]|0;if((G|0)==2|(H|0)==(E|0)){w=12;break}if(h>>>0<(c[z>>2]|0)>>>0){E=h;do{y=0;qa(104,l|0,a[E]|0);if(y){y=0;w=23;break b}E=E+1|0;}while(E>>>0<(c[z>>2]|0)>>>0);E=c[A>>2]|0}else{E=H}if(E>>>0>=C>>>0){break a}G=c[D>>2]|0}do{if((w|0)==12){w=lc(8)|0;y=0;qa(68,w|0,14024);if(y){y=0;t=Mb(-1,-1)|0;kb(w|0);break}y=0;Ha(16,w|0,25608,30);if(y){y=0;t=Mb(-1,-1)|0;break}}else if((w|0)==23){t=Mb(-1,-1)|0;}else if((w|0)==24){t=Mb(-1,-1)|0;}}while(0);vg(u|0);H=t;Yg(l);db(H|0)}}while(0);vg(u|0);if((a[v]&1)==0){t=l+1|0}else{t=c[l+8>>2]|0}t=(y=0,Ka(12,((e|0)==-1?-1:e<<1)|0,f|0,g|0,t|0)|0);if(y){y=0;H=Mb(-1,-1)|0;Yg(l);db(H|0)}Pp(s|0,0,12)|0;s=d|0;c[d+4>>2]=0;c[d>>2]=21256;H=Mp(t|0)|0;f=t+H|0;c[r>>2]=0;c[r+4>>2]=0;if((H|0)<1){H=d|0;vg(H);Yg(l);i=o;return}r=d;g=f;e=q|0;q=q+128|0;u=21256;c:while(1){c[p>>2]=t;u=(y=0,Ja(c[u+16>>2]|0,s|0,n|0,t|0,((g-t|0)>32?t+32|0:f)|0,p|0,e|0,q|0,m|0)|0);if(y){y=0;w=46;break}v=c[p>>2]|0;if((u|0)==2|(v|0)==(t|0)){w=35;break}if(e>>>0<(c[m>>2]|0)>>>0){t=e;do{y=0;qa(22,b|0,c[t>>2]|0);if(y){y=0;w=45;break c}t=t+4|0;}while(t>>>0<(c[m>>2]|0)>>>0);t=c[p>>2]|0}else{t=v}if(t>>>0>=f>>>0){w=44;break}u=c[r>>2]|0}do{if((w|0)==35){k=lc(8)|0;y=0;qa(68,k|0,14024);if(y){y=0;j=Mb(-1,-1)|0;kb(k|0);break}y=0;Ha(16,k|0,25608,30);if(y){y=0;j=Mb(-1,-1)|0;break}}else if((w|0)==44){H=d|0;vg(H);Yg(l);i=o;return}else if((w|0)==45){j=Mb(-1,-1)|0;}else if((w|0)==46){j=Mb(-1,-1)|0;}}while(0);vg(d|0);jh(b);H=j;Yg(l);db(H|0)}function tm(a,b){a=a|0;b=b|0;Wb(((b|0)==-1?-1:b<<1)|0)|0;return}function um(b){b=b|0;var d=0,e=0,f=0;c[b>>2]=20728;d=b+8|0;e=c[d>>2]|0;do{if((a[31424]|0)==0){if((xb(31424)|0)==0){break}f=(y=0,ta(8,2147483647,16448,0)|0);if(!y){c[7330]=f;break}else{y=0}Mb(-1,-1,0)|0;f=b|0;vg(f);Pb()}}while(0);if((e|0)==(c[7330]|0)){f=b|0;vg(f);return}y=0;pa(238,c[d>>2]|0);if(!y){f=b|0;vg(f);return}else{y=0}Mb(-1,-1,0)|0;f=b|0;vg(f);Pb()}function vm(a){a=a|0;var b=0;a=lc(8)|0;y=0;qa(54,a|0,16576);if(!y){c[a>>2]=19664;Hb(a|0,25640,44)}else{y=0;b=Mb(-1,-1)|0;kb(a|0);db(b|0)}}



function Vc(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Wc(){return i|0}function Xc(a){a=a|0;i=a}function Yc(a,b){a=a|0;b=b|0;if((y|0)==0){y=a;z=b}}function Zc(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function _c(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function $c(a){a=a|0;L=a}function ad(a){a=a|0;M=a}function bd(a){a=a|0;N=a}function cd(a){a=a|0;O=a}function dd(a){a=a|0;P=a}function ed(a){a=a|0;Q=a}function fd(a){a=a|0;R=a}function gd(a){a=a|0;S=a}function hd(a){a=a|0;T=a}function id(a){a=a|0;U=a}function jd(){c[6392]=p+8;c[6394]=t+8;c[6396]=s;c[6398]=t+8;c[6400]=s;c[6402]=t+8;c[6404]=s;c[6406]=t+8;c[6410]=t+8;c[6414]=t+8;c[6416]=s;c[6418]=p+8;c[6452]=t+8;c[6456]=t+8;c[6520]=t+8;c[6524]=t+8;c[6544]=p+8;c[6546]=t+8;c[6582]=t+8;c[6586]=t+8;c[6622]=t+8;c[6626]=t+8;c[6646]=p+8;c[6648]=p+8;c[6650]=t+8;c[6654]=t+8;c[6658]=t+8;c[6662]=t+8;c[6666]=t+8;c[6670]=p+8;c[6672]=p+8;c[6674]=p+8;c[6676]=p+8;c[6678]=p+8;c[6680]=p+8;c[6682]=p+8;c[6708]=t+8;c[6712]=p+8;c[6714]=t+8;c[6718]=t+8;c[6722]=t+8;c[6726]=p+8;c[6728]=p+8;c[6730]=p+8;c[6732]=p+8;c[6766]=p+8;c[6768]=p+8;c[6770]=p+8;c[6772]=t+8;c[6776]=t+8;c[6780]=t+8;c[6784]=t+8;c[6788]=t+8;c[6792]=t+8;c[6796]=t+8;c[6798]=s}function kd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;i=i+32|0;k=f|0;j=f+8|0;m=f+16|0;l=f+24|0;n=j|0;a[n]=0;c[j+4>>2]=b;g=b;o=c[(c[g>>2]|0)-12>>2]|0;h=b;a:do{if((c[h+(o+16)>>2]|0)==0){o=c[h+(o+72)>>2]|0;if((o|0)!=0){y=0,ra(80,o|0)|0;if(y){y=0;e=15;break}}a[n]=1;n=Mp(d|0)|0;q=c[(c[g>>2]|0)-12>>2]|0;c[m>>2]=c[h+(q+24)>>2];n=d+n|0;o=(c[h+(q+4)>>2]&176|0)==32?n:d;p=h+q|0;q=h+(q+76)|0;s=c[q>>2]|0;r=s&255;b:do{if((s|0)==-1){y=0;qa(84,k|0,p|0);if(y){y=0;e=16;break}r=(y=0,Da(54,k|0,30864)|0);do{if(!y){r=(y=0,Da(c[(c[r>>2]|0)+28>>2]|0,r|0,32)|0);if(y){y=0;break}y=0;pa(166,k|0);if(y){y=0;e=16;break b}c[q>>2]=r<<24>>24;e=12;break b}else{y=0}}while(0);d=Mb(-1,-1,0)|0;y=0;pa(166,k|0);if(!y){break}else{y=0}s=Mb(-1,-1,0)|0;nd(s);return 0}else{e=12}}while(0);do{if((e|0)==12){y=0;za(46,l|0,m|0,d|0,o|0,n|0,p|0,r|0);if(y){y=0;e=16;break}if((c[l>>2]|0)!=0){e=18;break a}s=c[(c[g>>2]|0)-12>>2]|0;y=0;qa(90,h+s|0,c[h+(s+16)>>2]|5|0);if(!y){e=18;break a}else{y=0;e=16}}}while(0);if((e|0)==16){d=Mb(-1,-1,0)|0;}y=0;pa(262,j|0);if(!y){break}else{y=0}s=Mb(-1,-1,0)|0;nd(s);return 0}else{e=18}}while(0);do{if((e|0)==18){y=0;pa(262,j|0);if(y){y=0;e=15;break}i=f;return b|0}}while(0);if((e|0)==15){d=Mb(-1,-1,0)|0;}yb(d|0)|0;y=0;pa(162,h+(c[(c[g>>2]|0)-12>>2]|0)|0);if(!y){Qa();i=f;return b|0}else{y=0}e=Mb(-1,-1)|0;y=0;Ia(6);if(!y){db(e|0)}else{y=0;s=Mb(-1,-1,0)|0;nd(s);return 0}return 0}function ld(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;g=i;i=i+32|0;j=g|0;h=g+8|0;l=g+16|0;k=g+24|0;m=h|0;a[m]=0;c[h+4>>2]=b;f=b;n=c[(c[f>>2]|0)-12>>2]|0;e=b;a:do{if((c[e+(n+16)>>2]|0)==0){n=c[e+(n+72)>>2]|0;if((n|0)!=0){y=0,ra(80,n|0)|0;if(y){y=0;m=30;break}}a[m]=1;r=d;m=a[d]|0;n=m&255;if((n&1|0)==0){q=n>>>1}else{q=c[d+4>>2]|0}o=c[(c[f>>2]|0)-12>>2]|0;c[l>>2]=c[e+(o+24)>>2];m=(m&1)==0;if(m){n=r+1|0}else{n=c[d+8>>2]|0}do{if((c[e+(o+4)>>2]&176|0)==32){if(m){p=r+1+q|0;m=18;break}else{p=(c[d+8>>2]|0)+q|0;m=17;break}}else{if(m){p=r+1|0;m=18;break}else{p=c[d+8>>2]|0;m=17;break}}}while(0);if((m|0)==17){d=c[d+8>>2]|0}else if((m|0)==18){d=r+1|0}q=d+q|0;d=e+o|0;o=e+(o+76)|0;s=c[o>>2]|0;r=s&255;b:do{if((s|0)==-1){y=0;qa(84,j|0,d|0);if(y){y=0;m=31;break}r=(y=0,Da(54,j|0,30864)|0);do{if(!y){r=(y=0,Da(c[(c[r>>2]|0)+28>>2]|0,r|0,32)|0);if(y){y=0;break}y=0;pa(166,j|0);if(y){y=0;m=31;break b}c[o>>2]=r<<24>>24;m=27;break b}else{y=0}}while(0);k=Mb(-1,-1,0)|0;y=0;pa(166,j|0);if(!y){break}else{y=0}s=Mb(-1,-1,0)|0;nd(s);return 0}else{m=27}}while(0);do{if((m|0)==27){y=0;za(46,k|0,l|0,n|0,p|0,q|0,d|0,r|0);if(y){y=0;m=31;break}if((c[k>>2]|0)!=0){m=33;break a}s=c[(c[f>>2]|0)-12>>2]|0;y=0;qa(90,e+s|0,c[e+(s+16)>>2]|5|0);if(!y){m=33;break a}else{y=0;m=31}}}while(0);if((m|0)==31){k=Mb(-1,-1,0)|0;}y=0;pa(262,h|0);if(!y){break}else{y=0}s=Mb(-1,-1,0)|0;nd(s);return 0}else{m=33}}while(0);do{if((m|0)==33){y=0;pa(262,h|0);if(y){y=0;m=30;break}i=g;return b|0}}while(0);if((m|0)==30){k=Mb(-1,-1,0)|0;}yb(k|0)|0;y=0;pa(162,e+(c[(c[f>>2]|0)-12>>2]|0)|0);if(!y){Qa();i=g;return b|0}else{y=0}b=Mb(-1,-1)|0;y=0;Ia(6);if(!y){db(b|0)}else{y=0;s=Mb(-1,-1,0)|0;nd(s);return 0}return 0}function md(b){b=b|0;c[b>>2]=22400;if((a[b+4|0]&1)==0){return}xp(c[b+12>>2]|0);return}function nd(a){a=a|0;yb(a|0)|0;Pb()}function od(b){b=b|0;var d=0;c[b>>2]=21164;c[b+56>>2]=21184;d=b+4|0;c[d>>2]=21368;if((a[b+36|0]&1)!=0){xp(c[b+44>>2]|0)}c[d>>2]=21512;y=0;pa(166,b+8|0);if(!y){rh(b+56|0);return}else{y=0}d=Mb(-1,-1)|0;y=0;pa(242,b+56|0);if(!y){db(d|0)}else{y=0;d=Mb(-1,-1,0)|0;nd(d)}}function pd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;m=i;i=i+32|0;n=m|0;g=m+16|0;f=g;r=i;i=i+12|0;i=i+7&-8;j=i;i=i+136|0;Pp(f|0,0,12)|0;o=n;y=0,Da(42,g|0,d|0)|0;a:do{if(!y){d=g;s=a[f]|0;t=s&255;v=(t&1|0)==0;if(v){u=t>>>1}else{u=c[g+4>>2]|0}b:do{if((u|0)!=0){s=(s&1)==0;if(s){w=d+1|0}else{w=c[g+8>>2]|0}u=w+u|0;do{if((u|0)==(w|0)){break b}u=u-1|0;}while((a[u]|0)!=92);w=u-w|0;if((w|0)==-1){break}u=w+1|0;if(v){v=t>>>1;t=t>>>1}else{t=c[g+4>>2]|0;v=t}t=t-w|0;if(v>>>0<u>>>0){y=0;pa(192,0);if(y){y=0;h=32;break a}}if(s){s=d+1|0}else{s=c[g+8>>2]|0}s=s+u|0;u=v-u|0;t=u>>>0<t>>>0?u:t;if(t>>>0>4294967279>>>0){y=0;pa(84,0);if(y){y=0;h=32;break a}}if(t>>>0<11>>>0){a[r]=t<<1;u=r+1|0}else{v=t+16&-16;u=(y=0,ra(130,v|0)|0);if(y){y=0;h=32;break a}c[r+8>>2]=u;c[r>>2]=v|1;c[r+4>>2]=t}Np(u|0,s|0,t)|0;a[u+t|0]=0;y=0,Da(42,g|0,r|0)|0;if(!y){if((a[r]&1)==0){break}xp(c[r+8>>2]|0);break}else{y=0;l=Mb(-1,-1)|0;if((a[r]&1)==0){break a}xp(c[r+8>>2]|0);break a}}}while(0);u=a[f]|0;s=u&255;r=(s&1|0)==0;if(r){t=s>>>1}else{t=c[g+4>>2]|0}c:do{if((t|0)!=0){if((u&1)==0){d=d+1|0}else{d=c[g+8>>2]|0}t=d+t|0;do{if((t|0)==(d|0)){break c}t=t-1|0;}while((a[t]|0)!=46);p=t-d|0;if((p|0)==-1){break}if(r){d=s>>>1}else{d=c[g+4>>2]|0}r=a[e]|0;if((r&1)==0){q=e+1|0}else{q=c[e+8>>2]|0}r=r&255;if((r&1|0)==0){e=r>>>1}else{e=c[e+4>>2]|0}y=0,Ga(22,g|0,p|0,d-1|0,q|0,e|0)|0;if(y){y=0;h=32;break a}}}while(0);e=j+56|0;r=j|0;v=j;u=j+4|0;c[r>>2]=27212;d=j+56|0;c[d>>2]=27232;y=0;qa(70,j+56|0,u|0);do{if(!y){c[j+128>>2]=0;c[j+132>>2]=-1;c[r>>2]=21164;c[e>>2]=21184;t=u|0;c[t>>2]=21512;p=j+8|0;Bm(p);Pp(j+12|0,0,24)|0;c[t>>2]=21368;q=j+36|0;Pp(j+36|0,0,16)|0;c[j+52>>2]=16;Pp(o|0,0,12)|0;y=0;qa(116,u|0,n|0);if(y){y=0;s=Mb(-1,-1)|0;if((a[o]&1)!=0){xp(c[n+8>>2]|0)}if((a[q]&1)!=0){xp(c[j+44>>2]|0)}c[t>>2]=21512;y=0;pa(166,p|0);if(!y){k=s;break}else{y=0}w=Mb(-1,-1,0)|0;nd(w)}if((a[o]&1)!=0){xp(c[n+8>>2]|0)}y=0,Da(60,v|0,g|0)|0;do{if(!y){y=0;qa(30,b|0,u|0);if(y){y=0;break}c[r>>2]=21164;c[d>>2]=21184;h=j+4|0;c[h>>2]=21368;if((a[q]&1)!=0){xp(c[j+44>>2]|0)}c[h>>2]=21512;y=0;pa(166,p|0);if(y){y=0;k=Mb(-1,-1)|0;y=0;pa(242,j+56|0);if(!y){h=33;break a}else{y=0}w=Mb(-1,-1,0)|0;nd(w)}y=0;pa(242,j+56|0);if(y){y=0;h=32;break a}if((a[f]&1)==0){i=m;return}xp(c[g+8>>2]|0);i=m;return}else{y=0}}while(0);m=Mb(-1,-1)|0;c[r>>2]=21164;c[d>>2]=21184;b=j+4|0;c[b>>2]=21368;if((a[q]&1)!=0){xp(c[j+44>>2]|0)}c[b>>2]=21512;y=0;pa(166,p|0);if(!y){y=0;pa(242,j+56|0);if(!y){l=m;break a}else{y=0}w=Mb(-1,-1,0)|0;nd(w)}else{y=0;m=Mb(-1,-1,0)|0;y=0;pa(242,j+56|0);if(!y){w=m;nd(w)}else{y=0;w=Mb(-1,-1,0)|0;nd(w)}}}else{y=0;k=Mb(-1,-1)|0;}}while(0);y=0;pa(242,e|0);if(!y){h=33;break}else{y=0;w=Mb(-1,-1,0)|0;nd(w)}}else{y=0;h=32}}while(0);if((h|0)==32){k=Mb(-1,-1)|0;h=33}if((h|0)==33){l=k}if((a[f]&1)==0){w=l;db(w|0)}xp(c[g+8>>2]|0);w=l;db(w|0)}function qd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;E=i;i=i+168|0;D=E|0;C=E+8|0;B=E+16|0;A=E+24|0;z=E+32|0;x=E+40|0;w=E+48|0;v=E+56|0;u=E+64|0;t=E+72|0;s=E+80|0;r=E+88|0;q=E+96|0;p=E+104|0;o=E+112|0;n=E+120|0;m=E+128|0;l=E+136|0;k=E+144|0;e=E+152|0;f=e;F=i;i=i+12|0;i=i+7&-8;h=i;i=i+12|0;i=i+7&-8;g=i;i=i+12|0;i=i+7&-8;Pp(f|0,0,12)|0;G=Mp(b|0)|0;a:do{if(G>>>0>4294967279>>>0){y=0;pa(84,0);if(y){y=0;d=212;break}}else{if(G>>>0<11>>>0){a[h]=G<<1;I=h+1|0}else{H=G+16&-16;I=(y=0,ra(130,H|0)|0);if(y){y=0;d=212;break}c[h+8>>2]=I;c[h>>2]=H|1;c[h+4>>2]=G}Np(I|0,b|0,G)|0;a[I+G|0]=0;b=g;a[b]=0;a[g+1|0]=0;y=0;Ha(10,F|0,h|0,g|0);b:do{if(!y){G=F;J=a[G]|0;if((J&1)==0){H=F+1|0}else{H=c[F+8>>2]|0}I=J&255;if((I&1|0)==0){I=I>>>1}else{I=c[F+4>>2]|0}L=e;M=a[f]|0;if((M&1)==0){K=10}else{M=c[e>>2]|0;K=(M&-2)-1|0;M=M&255}do{if(K>>>0<I>>>0){J=M&255;if((J&1|0)==0){J=J>>>1}else{J=c[e+4>>2]|0}y=0;wa(6,e|0,K|0,I-K|0,J|0,0,J|0,I|0,H|0);if(!y){J=a[G]|0;break}else{y=0}j=Mb(-1,-1)|0;if((a[G]&1)==0){break b}xp(c[F+8>>2]|0);break b}else{if((M&1)==0){G=L+1|0}else{G=c[e+8>>2]|0}Op(G|0,H|0,I|0)|0;a[G+I|0]=0;if((a[f]&1)==0){a[f]=I<<1;break}else{c[e+4>>2]=I;break}}}while(0);if((J&1)!=0){xp(c[F+8>>2]|0)}if((a[b]&1)!=0){xp(c[g+8>>2]|0)}if((a[h]&1)!=0){xp(c[h+8>>2]|0)}F=(y=0,Da(32,30960,11640)|0);if(y){y=0;d=212;break a}y=0;qa(84,k|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,k|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,k|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,18352)|0);if(y){y=0;d=212;break a}G=F;H=F;y=0;qa(84,l|0,H+(c[(c[G>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}I=(y=0,Da(54,l|0,30864)|0);do{if(!y){I=(y=0,Da(c[(c[I>>2]|0)+28>>2]|0,I|0,10)|0);if(y){y=0;break}y=0;pa(166,l|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,I|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}y=0;qa(84,m|0,H+(c[(c[G>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,m|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,m|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,18056)|0);if(y){y=0;d=212;break a}y=0;qa(84,n|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,n|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,n|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,17600)|0);if(y){y=0;d=212;break a}F=(y=0,Da(60,F|0,e|0)|0);if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,17288)|0);if(y){y=0;d=212;break a}H=F;G=F;y=0;qa(84,o|0,G+(c[(c[H>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}I=(y=0,Da(54,o|0,30864)|0);do{if(!y){I=(y=0,Da(c[(c[I>>2]|0)+28>>2]|0,I|0,10)|0);if(y){y=0;break}y=0;pa(166,o|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,I|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}y=0;qa(84,p|0,G+(c[(c[H>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,p|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,p|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,16976)|0);if(y){y=0;d=212;break a}y=0;qa(84,q|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,q|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,q|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,16824)|0);if(y){y=0;d=212;break a}y=0;qa(84,r|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,r|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,r|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,16584)|0);if(y){y=0;d=212;break a}y=0;qa(84,s|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,s|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,s|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,16456)|0);if(y){y=0;d=212;break a}y=0;qa(84,t|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,t|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,t|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,16376)|0);if(y){y=0;d=212;break a}y=0;qa(84,u|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,u|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,u|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,16312)|0);if(y){y=0;d=212;break a}y=0;qa(84,v|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,v|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,v|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,16184)|0);if(y){y=0;d=212;break a}y=0;qa(84,w|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,w|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,w|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,16104)|0);if(y){y=0;d=212;break a}y=0;qa(84,x|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,x|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,x|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,17600)|0);if(y){y=0;d=212;break a}F=(y=0,Da(60,F|0,e|0)|0);if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,15952)|0);if(y){y=0;d=212;break a}y=0;qa(84,z|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,z|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,z|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,15784)|0);if(y){y=0;d=212;break a}G=F;H=F;y=0;qa(84,A|0,H+(c[(c[G>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}I=(y=0,Da(54,A|0,30864)|0);do{if(!y){I=(y=0,Da(c[(c[I>>2]|0)+28>>2]|0,I|0,10)|0);if(y){y=0;break}y=0;pa(166,A|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,I|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}y=0;qa(84,B|0,H+(c[(c[G>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,B|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,B|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,17600)|0);if(y){y=0;d=212;break a}F=(y=0,Da(60,F|0,e|0)|0);if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,15680)|0);if(y){y=0;d=212;break a}y=0;qa(84,C|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,C|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,C|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}F=(y=0,Da(32,F|0,15472)|0);if(y){y=0;d=212;break a}y=0;qa(84,D|0,F+(c[(c[F>>2]|0)-12>>2]|0)|0);if(y){y=0;d=212;break a}G=(y=0,Da(54,D|0,30864)|0);do{if(!y){G=(y=0,Da(c[(c[G>>2]|0)+28>>2]|0,G|0,10)|0);if(y){y=0;break}y=0;pa(166,D|0);if(y){y=0;d=212;break a}y=0,Da(4,F|0,G|0)|0;if(y){y=0;d=212;break a}y=0,ra(80,F|0)|0;if(y){y=0;d=212;break a}if((a[f]&1)==0){i=E;return}xp(c[e+8>>2]|0);i=E;return}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,D|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,C|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,B|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,A|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,z|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,x|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,w|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,v|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,u|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,t|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,s|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,r|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,q|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,p|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,o|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,n|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,m|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,l|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0}}while(0);H=Mb(-1,-1)|0;y=0;pa(166,k|0);if(!y){d=213;break a}else{y=0}M=Mb(-1,-1,0)|0;nd(M)}else{y=0;j=Mb(-1,-1)|0;}}while(0);if((a[b]&1)!=0){xp(c[g+8>>2]|0)}if((a[h]&1)==0){H=j;break}xp(c[h+8>>2]|0);H=j}}while(0);if((d|0)==212){H=Mb(-1,-1)|0;d=213}if((d|0)==213){}if((a[f]&1)==0){M=H;db(M|0)}xp(c[e+8>>2]|0);M=H;db(M|0)}function rd(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0,j=0;e=i;i=i+24|0;d=e|0;b=e+8|0;a=e+16|0;f=kd(kd(kd(kd(kd(30960,15376)|0,15304)|0,15240)|0,15136)|0,15032)|0;sh(a,f+(c[(c[f>>2]|0)-12>>2]|0)|0);g=(y=0,Da(54,a|0,30864)|0);do{if(!y){g=(y=0,Da(c[(c[g>>2]|0)+28>>2]|0,g|0,10)|0);if(y){y=0;break}Dm(a);li(f,g)|0;_h(f)|0;f=kd(f,14936)|0;h=f;g=f;sh(b,g+(c[(c[h>>2]|0)-12>>2]|0)|0);j=(y=0,Da(54,b|0,30864)|0);do{if(!y){j=(y=0,Da(c[(c[j>>2]|0)+28>>2]|0,j|0,10)|0);if(y){y=0;break}Dm(b);li(f,j)|0;_h(f)|0;sh(d,g+(c[(c[h>>2]|0)-12>>2]|0)|0);g=(y=0,Da(54,d|0,30864)|0);do{if(!y){g=(y=0,Da(c[(c[g>>2]|0)+28>>2]|0,g|0,10)|0);if(y){y=0;break}Dm(d);li(f,g)|0;_h(f)|0;i=e;return}else{y=0}}while(0);e=Mb(-1,-1)|0;y=0;pa(166,d|0);if(!y){db(e|0)}else{y=0;j=Mb(-1,-1,0)|0;nd(j)}}else{y=0}}while(0);d=Mb(-1,-1)|0;y=0;pa(166,b|0);if(!y){db(d|0)}else{y=0;j=Mb(-1,-1,0)|0;nd(j)}}else{y=0}}while(0);b=Mb(-1,-1)|0;y=0;pa(166,a|0);if(!y){db(b|0)}else{y=0;j=Mb(-1,-1,0)|0;nd(j)}}function sd(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0,x=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,sa=0,ta=0,ua=0;f=i;i=i+1232|0;g=f|0;I=f+8|0;O=f+16|0;P=f+24|0;S=f+32|0;T=f+40|0;V=f+48|0;W=f+56|0;X=f+64|0;Z=f+72|0;H=f+80|0;_=f+96|0;aa=f+112|0;z=f+128|0;v=f+144|0;t=f+160|0;u=f+296|0;o=f+312|0;m=f+320|0;Y=f+456|0;B=f+472|0;E=f+488|0;G=f+504|0;n=f+512|0;C=f+528|0;$=f+544|0;r=f+672|0;M=f+808|0;U=f+944|0;N=f+960|0;K=f+976|0;J=f+1040|0;A=f+1048|0;F=f+1184|0;Q=f+1200|0;x=f+1208|0;k=f+1216|0;h=k;l=i;i=i+12|0;i=i+7&-8;w=i;i=i+12|0;i=i+7&-8;q=i;i=i+12|0;i=i+7&-8;rd();Pp(h|0,0,12)|0;j=l;Pp(j|0,0,12)|0;a:do{if((b|0)>1){R=l+4|0;ba=k+4|0;ca=4;fa=0;ga=1;da=1;b:while(1){ea=c[e+(da<<2)>>2]|0;c:do{if(ga){if((a[ea]|0)!=45){p=27;break}ka=ea+1|0;ja=a[ka]|0;if(ja<<24>>24==0){ga=1;break}else{ia=1;ga=1}while(1){switch(ja<<24>>24|0){case 48:{ca=0;break};case 49:{ca=1;break};case 51:{ca=2;break};case 53:{ca=3;break};case 45:{ia=0;break};case 104:{fa=1;break};default:{p=12;break b}}ga=ga+1|0;ka=ea+ga|0;ja=a[ka]|0;if(ja<<24>>24==0){ga=ia;break c}}}else{p=27}}while(0);do{if((p|0)==27){p=0;ia=d[h]|0;if((((ia&1|0)==0?ia>>>1:c[ba>>2]|0)|0)==0){y=0,Da(28,k|0,ea|0)|0;if(!y){break}else{y=0;p=23;break b}}ia=d[j]|0;if((((ia&1|0)==0?ia>>>1:c[R>>2]|0)|0)==0){y=0,Da(28,l|0,ea|0)|0;if(!y){break}else{y=0;p=23;break b}}ia=(y=0,Da(32,31136,14560)|0);if(y){y=0;p=23;break b}ea=(y=0,Da(32,ia|0,ea|0)|0);if(y){y=0;p=23;break b}ea=(y=0,Da(32,ea|0,14720)|0);if(y){y=0;p=23;break b}y=0;qa(84,Q|0,ea+(c[(c[ea>>2]|0)-12>>2]|0)|0);if(y){y=0;p=23;break b}ia=(y=0,Da(54,Q|0,30864)|0);if(y){y=0;p=37;break b}ia=(y=0,Da(c[(c[ia>>2]|0)+28>>2]|0,ia|0,10)|0);if(y){y=0;p=37;break b}y=0;pa(166,Q|0);if(y){y=0;p=23;break b}y=0,Da(4,ea|0,ia|0)|0;if(y){y=0;p=23;break b}y=0,ra(80,ea|0)|0;if(y){y=0;p=23;break b}}}while(0);da=da+1|0;if((da|0)>=(b|0)){p=43;break}}if((p|0)==12){m=(y=0,Da(32,31136,14808)|0);if(y){y=0;p=24;break}m=(y=0,Da(30,m|0,a[ka]|0)|0);if(y){y=0;p=24;break}m=(y=0,Da(32,m|0,14720)|0);if(y){y=0;p=24;break}y=0;qa(84,x|0,m+(c[(c[m>>2]|0)-12>>2]|0)|0);if(y){y=0;p=24;break}n=(y=0,Da(54,x|0,30864)|0);do{if(!y){n=(y=0,Da(c[(c[n>>2]|0)+28>>2]|0,n|0,10)|0);if(y){y=0;break}y=0;pa(166,x|0);if(y){y=0;p=24;break a}y=0,Da(4,m|0,n|0)|0;if(y){y=0;p=24;break a}y=0,ra(80,m|0)|0;if(!y){m=1;g=-1;p=511;break a}else{y=0;p=24;break a}}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,x|0);if(!y){p=25;break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else if((p|0)==23){Q=Mb(-1,-1,s|0)|0;b=L;p=25;break}else if((p|0)==37){m=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,Q|0);if(!y){Q=m;p=25;break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else if((p|0)==43){if(fa){p=48;break}else{p=44;break}}}else{ca=4;p=44}}while(0);d:do{if((p|0)==44){x=d[h]|0;if((x&1|0)==0){x=x>>>1}else{x=c[k+4>>2]|0}if((x|0)==0){p=48;break}x=d[j]|0;if((x&1|0)==0){x=x>>>1}else{x=c[l+4>>2]|0}e:do{if((x|0)==0){ua=q;x=q;a[x]=8;ta=ua+1|0;D=1735290926;a[ta]=D;D=D>>8;a[ta+1|0]=D;D=D>>8;a[ta+2|0]=D;D=D>>8;a[ta+3|0]=D;a[ua+5|0]=0;y=0;Ha(10,w|0,k|0,q|0);f:do{if(!y){e=w;ba=a[e]|0;if((ba&1)==0){Q=w+1|0}else{Q=c[w+8>>2]|0}R=ba&255;if((R&1|0)==0){R=R>>>1}else{R=c[w+4>>2]|0}da=l;ea=a[j]|0;if((ea&1)==0){b=10}else{ea=c[l>>2]|0;b=(ea&-2)-1|0;ea=ea&255}do{if(b>>>0<R>>>0){ba=ea&255;if((ba&1|0)==0){ba=ba>>>1}else{ba=c[l+4>>2]|0}y=0;wa(6,l|0,b|0,R-b|0,ba|0,0,ba|0,R|0,Q|0);if(!y){ba=a[e]|0;break}else{y=0}Q=Mb(-1,-1,s|0)|0;b=L;if((a[e]&1)==0){break f}xp(c[w+8>>2]|0);break f}else{if((ea&1)==0){e=da+1|0}else{e=c[l+8>>2]|0}Op(e|0,Q|0,R|0)|0;a[e+R|0]=0;if((a[j]&1)==0){a[j]=R<<1;break}else{c[l+4>>2]=R;break}}}while(0);if((ba&1)!=0){xp(c[w+8>>2]|0)}if((a[x]&1)==0){break e}xp(c[q+8>>2]|0);break e}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);if((a[x]&1)==0){break d}xp(c[q+8>>2]|0);break d}}while(0);R=H;da=_;ga=aa;ja=z;x=v;w=u;la=o|0;q=Y;e=B;ia=E;oa=G;na=n;fa=C;ka=$;ea=U;ba=N;b=K|0;Q=F;if((a[h]&1)==0){n=k+1|0}else{n=c[k+8>>2]|0}o=Jb(n|0,18448)|0;n=(o|0)==0;g:do{if(n){B=t+56|0;z=t|0;F=t;C=t+4|0;c[z>>2]=27212;A=t+56|0;c[A>>2]=27232;r=t+56|0;y=0;qa(70,r|0,C|0);do{if(!y){c[t+128>>2]=0;c[t+132>>2]=-1;c[z>>2]=21164;c[B>>2]=21184;E=C|0;c[E>>2]=21512;m=t+8|0;Bm(m);Pp(t+12|0,0,24)|0;c[E>>2]=21368;q=t+36|0;Pp(t+36|0,0,16)|0;c[t+52>>2]=16;Pp(x|0,0,12)|0;y=0;qa(116,C|0,v|0);if(y){y=0;Q=Mb(-1,-1,s|0)|0;b=L;if((a[x]&1)!=0){xp(c[v+8>>2]|0)}if((a[q]&1)!=0){xp(c[t+44>>2]|0)}c[E>>2]=21512;y=0;pa(166,m|0);if(!y){break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}if((a[x]&1)!=0){xp(c[v+8>>2]|0)}v=(y=0,Da(32,F|0,18424)|0);h:do{if(!y){v=(y=0,Da(60,v|0,k|0)|0);if(y){y=0;p=119;break}y=0,Da(32,v|0,16208)|0;if(y){y=0;p=119;break}v=lc(16)|0;y=0;qa(30,u|0,C|0);do{if(!y){c[v>>2]=22400;B=v+4|0;x=(a[w]&1)==0;i:do{if(x){c[B>>2]=c[w>>2];c[B+4>>2]=c[w+4>>2];c[B+8>>2]=c[w+8>>2];p=116}else{w=c[u+8>>2]|0;C=c[u+4>>2]|0;do{if(C>>>0>4294967279>>>0){y=0;pa(84,0);if(y){y=0;break}return 0}else{if(C>>>0<11>>>0){a[B]=C<<1;F=v+5|0}else{E=C+16&-16;F=(y=0,ra(130,E|0)|0);if(y){y=0;break}c[v+12>>2]=F;c[B>>2]=E|1;c[v+8>>2]=C}Np(F|0,w|0,C)|0;a[F+C|0]=0;p=116;break i}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;w=1}}while(0);do{if((p|0)==116){y=0;Ha(16,v|0,27184,6);if(!y){return 0}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L;w=0;break}}}while(0);if(x){if(w){break}else{break h}}else{xp(c[u+8>>2]|0);if(w){break}else{break h}}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);kb(v|0)}else{y=0;p=119}}while(0);if((p|0)==119){Q=Mb(-1,-1,s|0)|0;b=L}c[z>>2]=21164;c[A>>2]=21184;u=t+4|0;c[u>>2]=21368;if((a[q]&1)!=0){xp(c[t+44>>2]|0)}c[u>>2]=21512;y=0;pa(166,m|0);if(!y){y=0;pa(242,r|0);if(!y){break g}else{y=0;p=500;break g}}else{y=0}f=Mb(-1,-1,0)|0;y=0;pa(242,r|0);if(!y){ua=f;nd(ua);return 0}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);y=0;pa(242,B|0);if(!y){p=118;break}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}else{sa=m+56|0;x=m|0;ta=m;ma=m+4|0;c[x>>2]=27212;w=m+56|0;c[w>>2]=27232;t=m+56|0;y=0;qa(70,t|0,ma|0);do{if(!y){c[m+128>>2]=0;c[m+132>>2]=-1;c[x>>2]=21164;c[sa>>2]=21184;ua=ma|0;c[ua>>2]=21512;u=m+8|0;Bm(u);Pp(m+12|0,0,24)|0;c[ua>>2]=21368;v=m+36|0;Pp(m+36|0,0,16)|0;c[m+52>>2]=16;Pp(ja|0,0,12)|0;y=0;qa(116,ma|0,z|0);if(y){y=0;Q=Mb(-1,-1,s|0)|0;b=L;if((a[ja]&1)!=0){xp(c[z+8>>2]|0)}if((a[v]&1)!=0){xp(c[m+44>>2]|0)}c[ua>>2]=21512;y=0;pa(166,u|0);if(!y){break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}if((a[ja]&1)!=0){xp(c[z+8>>2]|0)}a[q]=14;z=Y+1|0;a[z]=a[14144]|0;a[z+1|0]=a[14145]|0;a[z+2|0]=a[14146]|0;a[z+3|0]=a[14147]|0;a[z+4|0]=a[14148]|0;a[z+5|0]=a[14149]|0;a[z+6|0]=a[14150]|0;z=Y+8|0;a[z]=0;j:do{if((cc(la|0,4,1,o|0)|0)==0){y=0,Da(32,ta|0,13512)|0;if(y){y=0;p=149;break}r=lc(16)|0;y=0;qa(30,E|0,ma|0);do{if(!y){c[r>>2]=22400;F=r+4|0;A=(a[ia]&1)==0;k:do{if(A){c[F>>2]=c[ia>>2];c[F+4>>2]=c[ia+4>>2];c[F+8>>2]=c[ia+8>>2];p=192}else{C=c[E+8>>2]|0;B=c[E+4>>2]|0;do{if(B>>>0>4294967279>>>0){y=0;pa(84,0);if(y){y=0;break}return 0}else{if(B>>>0<11>>>0){a[F]=B<<1;G=r+5|0}else{e=B+16&-16;G=(y=0,ra(130,e|0)|0);if(y){y=0;break}c[r+12>>2]=G;c[F>>2]=e|1;c[r+8>>2]=B}Np(G|0,C|0,B)|0;a[G+B|0]=0;p=192;break k}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;B=1}}while(0);do{if((p|0)==192){y=0;Ha(16,r|0,27184,6);if(!y){return 0}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L;B=0;break}}}while(0);if(A){if(B){break}else{break j}}else{xp(c[E+8>>2]|0);if(B){break}else{break j}}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);kb(r|0)}else{do{if((Qp(la|0,14088,4)|0)==0){y=0,Da(28,Y|0,13960)|0;if(!y){ia=-1;ja=0}else{y=0;p=149;break j}}else{do{if((Qp(la|0,13904,4)|0)==0){y=0,Da(28,Y|0,13856)|0;if(!y){ia=-1;ja=0}else{y=0;p=149;break j}}else{if((Qp(la|0,13776,4)|0)==0){y=0,Da(28,Y|0,13680)|0;if(y){y=0;p=149;break j}cc(oa|0,8,1,o|0)|0;ia=c[G+4>>2]|0;cc(la|0,4,1,o|0)|0;ja=1;break}r=(y=0,Da(32,ta|0,13624)|0);if(y){y=0;p=149;break j}r=(y=0,Da(32,r|0,la|0)|0);if(y){y=0;p=149;break j}r=(y=0,Da(32,r|0,13560)|0);if(y){y=0;p=149;break j}r=(y=0,Da(32,r|0,14088)|0);if(y){y=0;p=149;break j}y=0,Da(32,r|0,13552)|0;if(y){y=0;p=149;break j}r=lc(16)|0;y=0;qa(30,B|0,ma|0);do{if(!y){c[r>>2]=22400;F=r+4|0;A=(a[e]&1)==0;l:do{if(A){c[F>>2]=c[e>>2];c[F+4>>2]=c[e+4>>2];c[F+8>>2]=c[e+8>>2];p=172}else{E=c[B+8>>2]|0;C=c[B+4>>2]|0;do{if(C>>>0>4294967279>>>0){y=0;pa(84,0);if(y){y=0;break}return 0}else{if(C>>>0<11>>>0){a[F]=C<<1;e=r+5|0}else{G=C+16&-16;e=(y=0,ra(130,G|0)|0);if(y){y=0;break}c[r+12>>2]=e;c[F>>2]=G|1;c[r+8>>2]=C}Np(e|0,E|0,C)|0;a[e+C|0]=0;p=172;break l}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;C=1}}while(0);do{if((p|0)==172){y=0;Ha(16,r|0,27184,6);if(!y){return 0}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L;C=0;break}}}while(0);if(A){if(C){break}else{break j}}else{xp(c[B+8>>2]|0);if(C){break}else{break j}}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);kb(r|0);break j}}while(0);cc(na|0,12,1,o|0)|0;cc(la|0,4,1,o|0)|0;if((Qp(la|0,14088,4)|0)==0){break}y=0,Da(32,ta|0,13448)|0;if(y){y=0;p=149;break j}r=lc(16)|0;y=0;qa(30,C|0,ma|0);do{if(!y){c[r>>2]=22400;E=r+4|0;A=(a[fa]&1)==0;m:do{if(A){c[E>>2]=c[fa>>2];c[E+4>>2]=c[fa+4>>2];c[E+8>>2]=c[fa+8>>2];p=214}else{F=c[C+8>>2]|0;B=c[C+4>>2]|0;do{if(B>>>0>4294967279>>>0){y=0;pa(84,0);if(y){y=0;break}return 0}else{if(B>>>0<11>>>0){a[E]=B<<1;G=r+5|0}else{e=B+16&-16;G=(y=0,ra(130,e|0)|0);if(y){y=0;break}c[r+12>>2]=G;c[E>>2]=e|1;c[r+8>>2]=B}Np(G|0,F|0,B)|0;a[G+B|0]=0;p=214;break m}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;B=1}}while(0);do{if((p|0)==214){y=0;Ha(16,r|0,27184,6);if(!y){return 0}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L;B=0;break}}}while(0);if(A){if(B){break}else{break j}}else{xp(c[C+8>>2]|0);if(B){break}else{break j}}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);kb(r|0);break j}}while(0);cc(ka|0,124,1,o|0)|0;ka=r+56|0;e=r|0;ma=r;fa=r+4|0;c[e>>2]=27212;G=r+56|0;c[G>>2]=27232;B=r+56|0;y=0;qa(70,B|0,fa|0);do{if(!y){c[r+128>>2]=0;c[r+132>>2]=-1;c[e>>2]=21164;c[ka>>2]=21184;la=fa|0;c[la>>2]=21512;E=r+8|0;Bm(E);Pp(r+12|0,0,24)|0;c[la>>2]=21368;C=r+36|0;Pp(r+36|0,0,16)|0;c[r+52>>2]=16;Pp(ga|0,0,12)|0;y=0;qa(116,fa|0,aa|0);if(y){y=0;Q=Mb(-1,-1,s|0)|0;b=L;if((a[ga]&1)!=0){xp(c[aa+8>>2]|0)}if((a[C]&1)!=0){xp(c[r+44>>2]|0)}c[la>>2]=21512;y=0;pa(166,E|0);if(!y){break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}if((a[ga]&1)!=0){xp(c[aa+8>>2]|0)}n:do{switch(ca|0){case 4:{aa=c[$+80>>2]|0;if((aa|0)==844388420|(aa|0)==877942852){K=M+56|0;J=M|0;P=M;O=M+4|0;c[J>>2]=27212;I=M+56|0;c[I>>2]=27232;H=M+56|0;y=0;qa(70,H|0,O|0);do{if(!y){c[M+128>>2]=0;c[M+132>>2]=-1;c[J>>2]=21164;c[K>>2]=21184;N=O|0;c[N>>2]=21512;A=M+8|0;Bm(A);Pp(M+12|0,0,24)|0;c[N>>2]=21368;F=M+36|0;Pp(M+36|0,0,16)|0;c[M+52>>2]=16;Pp(da|0,0,12)|0;y=0;qa(116,O|0,_|0);if(y){y=0;Q=Mb(-1,-1,s|0)|0;b=L;if((a[da]&1)!=0){xp(c[_+8>>2]|0)}if((a[F]&1)!=0){xp(c[M+44>>2]|0)}c[N>>2]=21512;y=0;pa(166,A|0);if(!y){break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}if((a[da]&1)!=0){xp(c[_+8>>2]|0)}y=0,Da(32,P|0,13368)|0;o:do{if(!y){K=lc(16)|0;y=0;qa(30,U|0,O|0);do{if(!y){c[K>>2]=22400;Q=K+4|0;N=(a[ea]&1)==0;p:do{if(N){c[Q>>2]=c[ea>>2];c[Q+4>>2]=c[ea+4>>2];c[Q+8>>2]=c[ea+8>>2];p=264}else{P=c[U+8>>2]|0;O=c[U+4>>2]|0;do{if(O>>>0>4294967279>>>0){y=0;pa(84,0);if(y){y=0;break}return 0}else{if(O>>>0<11>>>0){a[Q]=O<<1;S=K+5|0}else{R=O+16&-16;S=(y=0,ra(130,R|0)|0);if(y){y=0;break}c[K+12>>2]=S;c[Q>>2]=R|1;c[K+8>>2]=O}Np(S|0,P|0,O)|0;a[S+O|0]=0;p=264;break p}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;O=1}}while(0);do{if((p|0)==264){y=0;Ha(16,K|0,27184,6);if(!y){return 0}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L;O=0;break}}}while(0);if(N){if(O){break}else{break o}}else{xp(c[U+8>>2]|0);if(O){break}else{break o}}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);kb(K|0)}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);c[J>>2]=21164;c[I>>2]=21184;I=M+4|0;c[I>>2]=21368;if((a[F]&1)!=0){xp(c[M+44>>2]|0)}c[I>>2]=21512;y=0;pa(166,A|0);if(!y){y=0;pa(242,H|0);if(!y){break n}else{y=0;p=500;break g}}else{y=0}f=Mb(-1,-1,0)|0;y=0;pa(242,H|0);if(!y){ua=f;nd(ua);return 0}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);y=0;pa(242,K|0);if(!y){p=266;break n}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}else if((aa|0)==827611204){y=0,Da(32,ma|0,13360)|0;if(!y){ca=1;p=288;break n}else{y=0;p=265;break n}}else if((aa|0)==861165636){y=0,Da(32,ma|0,13280)|0;if(!y){ca=2;p=288;break n}else{y=0;p=265;break n}}else if((aa|0)==894720068){y=0,Da(32,ma|0,13232)|0;if(!y){ca=4;p=288;break n}else{y=0;p=265;break n}}else{p=287;break n}break};case 0:{y=0,Da(32,ma|0,13176)|0;if(!y){p=287}else{y=0;p=265}break};case 1:{y=0,Da(32,ma|0,13360)|0;if(!y){ca=1;p=288}else{y=0;p=265}break};case 2:{y=0,Da(32,ma|0,13280)|0;if(!y){ca=2;p=288}else{y=0;p=265}break};case 3:{y=0,Da(32,ma|0,13232)|0;if(!y){ca=4;p=288}else{y=0;p=265}break};default:{ca=1;p=288}}}while(0);if((p|0)==287){aa=64;ca=1;da=1;_=c[$+12>>2]|0;U=c[$+8>>2]|0;p=289}else if((p|0)==288){aa=(ca<<3&8^8)+8|0;da=0;_=c[$+12>>2]|0;U=c[$+8>>2]|0;p=289}do{if((p|0)==289){$=(ha(ha(_,U)|0,aa)|0)/16|0;M=(y=0,ra(146,(($|0)>-1?$:-1)|0)|0);if(y){y=0;p=265;break}ea=(y=0,Da(32,30960,13136)|0);q:do{if(!y){ea=(y=0,Da(60,ea|0,k|0)|0);if(y){y=0;p=331;break}y=0;qa(84,Z|0,ea+(c[(c[ea>>2]|0)-12>>2]|0)|0);if(y){y=0;p=331;break}ga=(y=0,Da(54,Z|0,30864)|0);do{if(!y){ga=(y=0,Da(c[(c[ga>>2]|0)+28>>2]|0,ga|0,10)|0);if(y){y=0;break}y=0;pa(166,Z|0);if(y){y=0;p=331;break q}y=0,Da(4,ea|0,ga|0)|0;if(y){y=0;p=331;break q}y=0,ra(80,ea|0)|0;if(y){y=0;p=331;break q}Z=(y=0,Da(32,ea|0,13096)|0);if(y){y=0;p=331;break q}Z=(y=0,Da(60,Z|0,l|0)|0);if(y){y=0;p=331;break q}y=0;qa(84,X|0,Z+(c[(c[Z>>2]|0)-12>>2]|0)|0);if(y){y=0;p=331;break q}ea=(y=0,Da(54,X|0,30864)|0);do{if(!y){ea=(y=0,Da(c[(c[ea>>2]|0)+28>>2]|0,ea|0,10)|0);if(y){y=0;break}y=0;pa(166,X|0);if(y){y=0;p=331;break q}y=0,Da(4,Z|0,ea|0)|0;if(y){y=0;p=331;break q}y=0,ra(80,Z|0)|0;if(y){y=0;p=331;break q}X=(y=0,Da(32,Z|0,13080)|0);if(y){y=0;p=331;break q}X=(y=0,Da(60,X|0,Y|0)|0);if(y){y=0;p=331;break q}y=0;qa(84,W|0,X+(c[(c[X>>2]|0)-12>>2]|0)|0);if(y){y=0;p=331;break q}Y=(y=0,Da(54,W|0,30864)|0);do{if(!y){Y=(y=0,Da(c[(c[Y>>2]|0)+28>>2]|0,Y|0,10)|0);if(y){y=0;break}y=0;pa(166,W|0);if(y){y=0;p=331;break q}y=0,Da(4,X|0,Y|0)|0;if(y){y=0;p=331;break q}y=0,ra(80,X|0)|0;if(y){y=0;p=331;break q}r:do{if(ja){W=(y=0,Da(32,30960,12992)|0);if(y){y=0;p=331;break q}W=(y=0,Da(40,W|0,ia|0)|0);if(y){y=0;p=331;break q}y=0;qa(84,V|0,W+(c[(c[W>>2]|0)-12>>2]|0)|0);if(y){y=0;p=331;break q}X=(y=0,Da(54,V|0,30864)|0);do{if(!y){X=(y=0,Da(c[(c[X>>2]|0)+28>>2]|0,X|0,10)|0);if(y){y=0;break}y=0;pa(166,V|0);if(y){y=0;p=331;break q}y=0,Da(4,W|0,X|0)|0;if(y){y=0;p=331;break q}y=0,ra(80,W|0)|0;if(!y){break r}else{y=0;p=331;break q}}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,V|0);if(!y){p=332;break q}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}}while(0);V=(y=0,Da(32,30960,12936)|0);if(y){y=0;p=331;break q}V=(y=0,Da(40,V|0,_|0)|0);if(y){y=0;p=331;break q}V=(y=0,Da(32,V|0,12904)|0);if(y){y=0;p=331;break q}V=(y=0,Da(40,V|0,U|0)|0);if(y){y=0;p=331;break q}y=0;qa(84,T|0,V+(c[(c[V>>2]|0)-12>>2]|0)|0);if(y){y=0;p=331;break q}W=(y=0,Da(54,T|0,30864)|0);do{if(!y){W=(y=0,Da(c[(c[W>>2]|0)+28>>2]|0,W|0,10)|0);if(y){y=0;break}y=0;pa(166,T|0);if(y){y=0;p=331;break q}y=0,Da(4,V|0,W|0)|0;if(y){y=0;p=331;break q}y=0,ra(80,V|0)|0;if(y){y=0;p=331;break q}T=(y=0,Da(32,V|0,12864)|0);if(y){y=0;p=331;break q}T=(y=0,Da(40,T|0,$|0)|0);if(y){y=0;p=331;break q}y=0;qa(84,S|0,T+(c[(c[T>>2]|0)-12>>2]|0)|0);if(y){y=0;p=331;break q}V=(y=0,Da(54,S|0,30864)|0);do{if(!y){V=(y=0,Da(c[(c[V>>2]|0)+28>>2]|0,V|0,10)|0);if(y){y=0;break}y=0;pa(166,S|0);if(y){y=0;p=331;break q}y=0,Da(4,T|0,V|0)|0;if(y){y=0;p=331;break q}y=0,ra(80,T|0)|0;if(y){y=0;p=331;break q}S=(y=0,Da(32,T|0,12792)|0);if(y){y=0;p=331;break q}y=0;qa(30,N|0,fa|0);if(y){y=0;p=331;break q}S=(y=0,Da(60,S|0,N|0)|0);s:do{if(!y){V=S;T=S;y=0;qa(84,P|0,T+(c[(c[V>>2]|0)-12>>2]|0)|0);if(y){y=0;p=394;break}W=(y=0,Da(54,P|0,30864)|0);do{if(!y){W=(y=0,Da(c[(c[W>>2]|0)+28>>2]|0,W|0,10)|0);if(y){y=0;break}y=0;pa(166,P|0);if(y){y=0;p=394;break s}y=0,Da(4,S|0,W|0)|0;if(y){y=0;p=394;break s}y=0,ra(80,S|0)|0;if(y){y=0;p=394;break s}y=0;qa(84,O|0,T+(c[(c[V>>2]|0)-12>>2]|0)|0);if(y){y=0;p=394;break s}P=(y=0,Da(54,O|0,30864)|0);do{if(!y){P=(y=0,Da(c[(c[P>>2]|0)+28>>2]|0,P|0,10)|0);if(y){y=0;break}y=0;pa(166,O|0);if(y){y=0;p=394;break s}y=0,Da(4,S|0,P|0)|0;if(y){y=0;p=394;break s}y=0,ra(80,S|0)|0;if(y){y=0;p=394;break s}y=0,Da(32,S|0,12752)|0;if(y){y=0;p=394;break s}if((a[ba]&1)!=0){xp(c[N+8>>2]|0)}cc(M|0,1,$|0,o|0)|0;O=qp(U<<2)|0;N=O;P=(U|0)>0;do{if(P){p=_<<2;c[N>>2]=qp(p)|0;if((U|0)>1){S=1}else{break}do{c[N+(S<<2)>>2]=qp(p)|0;S=S+1|0;}while((S|0)<(U|0))}}while(0);t:do{if(da){if(P&(_|0)>0){T=0}else{p=400;break}while(1){K=N+(T<<2)|0;S=ha(T,_)|0;p=0;do{ta=c[K>>2]|0;ua=p<<2;sa=p+S<<2;oa=ua|1;a[ta+ua|0]=a[M+(sa|1)|0]|0;a[ta+oa|0]=a[M+(sa|2)|0]|0;a[ta+(oa+1)|0]=a[M+(sa|3)|0]|0;a[ta+(ua|3)|0]=a[M+sa|0]|0;p=p+1|0;}while((p|0)<(_|0));T=T+1|0;if((T|0)>=(U|0)){p=400;break}}}else{if(!P){p=400;break}if((_|0)>0){p=M;S=0}else{p=0;while(1){p=p+4|0;if((p|0)>=(U|0)){p=400;break t}}}u:while(1){T=0;do{y=0;Ha(28,b|0,p|0,ca|0);if(y){y=0;break u}na=T<<2;ma=na|1;la=ma+1|0;ka=na|3;ba=na|4;fa=na|5;$=fa+1|0;da=na|7;ea=ba+4|0;ga=ba+5|0;ia=ba+6|0;ja=ba+7|0;V=na|12;W=na|13;X=W+1|0;Y=na|15;oa=0;Z=0;while(1){ua=c[N+(oa+S<<2)>>2]|0;ta=Z<<2;a[ua+na|0]=a[K+ta|0]|0;a[ua+ma|0]=a[K+(ta|1)|0]|0;a[ua+la|0]=a[K+(ta|2)|0]|0;a[ua+ka|0]=a[K+(ta|3)|0]|0;sa=ta|4;a[ua+ba|0]=a[K+sa|0]|0;a[ua+fa|0]=a[K+(ta|5)|0]|0;a[ua+$|0]=a[K+(ta|6)|0]|0;a[ua+da|0]=a[K+(ta|7)|0]|0;sa=sa+4|0;a[ua+ea|0]=a[K+sa|0]|0;a[ua+ga|0]=a[K+(sa|1)|0]|0;a[ua+ia|0]=a[K+(sa|2)|0]|0;a[ua+ja|0]=a[K+(sa|3)|0]|0;a[ua+V|0]=a[K+(ta|12)|0]|0;a[ua+W|0]=a[K+(ta|13)|0]|0;a[ua+X|0]=a[K+(ta|14)|0]|0;a[ua+Y|0]=a[K+(ta|15)|0]|0;oa=oa+1|0;if((oa|0)<4){Z=Z+4|0}else{break}}p=p+aa|0;T=T+4|0;}while((T|0)<(_|0));S=S+4|0;if((S|0)>=(U|0)){p=400;break t}}Q=Mb(-1,-1,s|0)|0;b=L;p=398}}while(0);v:do{if((p|0)==400){y=0;pa(214,J|0);w:do{if(!y){K=J|0;J=J+4|0;y=0;Ba(4,c[K>>2]|0,c[J>>2]|0,_|0,U|0,8,6,0,0,0);do{if(!y){if((a[j]&1)==0){S=l+1|0}else{S=c[l+8>>2]|0}S=Jb(S|0,12680)|0;T=(S|0)==0;x:do{if(T){Z=A+56|0;Y=A|0;$=A;b=A+4|0;c[Y>>2]=27212;X=A+56|0;c[X>>2]=27232;W=A+56|0;y=0;qa(70,W|0,b|0);do{if(!y){c[A+128>>2]=0;c[A+132>>2]=-1;c[Y>>2]=21164;c[Z>>2]=21184;_=b|0;c[_>>2]=21512;I=A+8|0;Bm(I);Pp(A+12|0,0,24)|0;c[_>>2]=21368;V=A+36|0;Pp(A+36|0,0,16)|0;c[A+52>>2]=16;Pp(R|0,0,12)|0;y=0;qa(116,b|0,H|0);if(y){y=0;Q=Mb(-1,-1,s|0)|0;b=L;if((a[R]&1)!=0){xp(c[H+8>>2]|0)}if((a[V]&1)!=0){xp(c[A+44>>2]|0)}c[_>>2]=21512;y=0;pa(166,I|0);if(!y){break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}if((a[R]&1)!=0){xp(c[H+8>>2]|0)}H=(y=0,Da(32,$|0,18424)|0);y:do{if(!y){H=(y=0,Da(60,H|0,l|0)|0);if(y){y=0;p=439;break}y=0,Da(32,H|0,12632)|0;if(y){y=0;p=439;break}H=lc(16)|0;y=0;qa(30,F|0,b|0);do{if(!y){c[H>>2]=22400;Z=H+4|0;R=(a[Q]&1)==0;z:do{if(R){c[Z>>2]=c[Q>>2];c[Z+4>>2]=c[Q+4>>2];c[Z+8>>2]=c[Q+8>>2];p=435}else{Q=c[F+8>>2]|0;b=c[F+4>>2]|0;do{if(b>>>0>4294967279>>>0){y=0;pa(84,0);if(y){y=0;break}return 0}else{if(b>>>0<11>>>0){a[Z]=b<<1;$=H+5|0}else{_=b+16&-16;$=(y=0,ra(130,_|0)|0);if(y){y=0;break}c[H+12>>2]=$;c[Z>>2]=_|1;c[H+8>>2]=b}Np($|0,Q|0,b)|0;a[$+b|0]=0;p=435;break z}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;Z=1}}while(0);do{if((p|0)==435){y=0;Ha(16,H|0,27184,6);if(!y){return 0}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L;Z=0;break}}}while(0);if(R){if(Z){break}else{break y}}else{xp(c[F+8>>2]|0);if(Z){break}else{break y}}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);kb(H|0)}else{y=0;p=439}}while(0);if((p|0)==439){Q=Mb(-1,-1,s|0)|0;b=L}c[Y>>2]=21164;c[X>>2]=21184;F=A+4|0;c[F>>2]=21368;if((a[V]&1)!=0){xp(c[A+44>>2]|0)}c[F>>2]=21512;y=0;pa(166,I|0);if(!y){y=0;pa(242,W|0);if(!y){break x}else{y=0;p=500;break g}}else{y=0}f=Mb(-1,-1,0)|0;y=0;pa(242,W|0);if(!y){ua=f;nd(ua);return 0}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);y=0;pa(242,Z|0);if(!y){p=438;break}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}else{y=0;Ha(6,c[K>>2]|0,c[J>>2]|0,N|0);do{if(!y){y=0;qa(106,c[K>>2]|0,S|0);if(y){y=0;break}y=0;La(12,c[K>>2]|0,c[J>>2]|0,0,0);if(y){y=0;break}y=0,Da(32,30960,12560)|0;if(y){y=0;break}Oa(S|0)|0;y=0;qa(20,K|0,J|0);if(y){y=0;break w}if(P){p=0;do{rp(c[N+(p<<2)>>2]|0);p=p+1|0;}while((p|0)<(U|0))}rp(O);if((M|0)!=0){yp(M)}c[e>>2]=21164;c[G>>2]=21184;p=r+4|0;c[p>>2]=21368;if((a[C]&1)!=0){xp(c[r+44>>2]|0)}c[p>>2]=21512;y=0;pa(166,E|0);if(y){y=0;Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(242,B|0);if(!y){p=150;break j}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}y=0;pa(242,B|0);if(y){y=0;p=149;break j}if((a[q]&1)!=0){xp(c[z>>2]|0)}c[x>>2]=21164;c[w>>2]=21184;p=m+4|0;c[p>>2]=21368;if((a[v]&1)!=0){xp(c[m+44>>2]|0)}c[p>>2]=21512;y=0;pa(166,u|0);if(y){y=0;Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(242,t|0);if(!y){p=118;break g}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}y=0;pa(242,t|0);if(y){y=0;Q=Mb(-1,-1,s|0)|0;b=L;p=118;break g}Oa(o|0)|0;y=0;qa(84,I|0,30960+(c[(c[7740]|0)-12>>2]|0)|0);if(y){y=0;p=24;break d}m=(y=0,Da(54,I|0,30864)|0);do{if(!y){m=(y=0,Da(c[(c[m>>2]|0)+28>>2]|0,m|0,10)|0);if(y){y=0;break}y=0;pa(166,I|0);if(y){y=0;p=24;break d}y=0,Da(4,30960,m|0)|0;if(y){y=0;p=24;break d}y=0,ra(80,30960)|0;if(!y){m=0;g=0;p=511;break d}else{y=0;p=24;break d}}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,I|0);if(!y){p=25;break d}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;p=438}}while(0);if((p|0)==438){}if(T){break}Oa(S|0)|0}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);y=0;qa(20,K|0,J|0);if(!y){break v}else{y=0;p=500;break g}}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;p=398}}while(0);if((p|0)==398){}if(P){A=0;do{rp(c[N+(A<<2)>>2]|0);A=A+1|0;}while((A|0)<(U|0))}rp(O);break q}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,O|0);if(!y){break s}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,P|0);if(!y){break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0;p=394}}while(0);if((p|0)==394){Q=Mb(-1,-1,s|0)|0;b=L}if((a[ba]&1)==0){break q}xp(c[N+8>>2]|0);break q}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,S|0);if(!y){p=332;break q}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,T|0);if(!y){p=332;break q}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,W|0);if(!y){p=332;break q}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,X|0);if(!y){p=332;break q}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0}}while(0);Q=Mb(-1,-1,s|0)|0;b=L;y=0;pa(166,Z|0);if(!y){p=332;break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0;p=331}}while(0);if((p|0)==331){Q=Mb(-1,-1,s|0)|0;b=L;p=332}if((p|0)==332){}if((M|0)==0){break}yp(M)}}while(0);if((p|0)==265){Q=Mb(-1,-1,s|0)|0;b=L;p=266}if((p|0)==266){}c[e>>2]=21164;c[G>>2]=21184;A=r+4|0;c[A>>2]=21368;if((a[C]&1)!=0){xp(c[r+44>>2]|0)}c[A>>2]=21512;y=0;pa(166,E|0);if(!y){y=0;pa(242,B|0);if(!y){break j}else{y=0;p=500;break g}}else{y=0}f=Mb(-1,-1,0)|0;y=0;pa(242,B|0);if(!y){ua=f;nd(ua);return 0}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);y=0;pa(242,ka|0);if(!y){p=150;break}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}}while(0);if((p|0)==149){Q=Mb(-1,-1,s|0)|0;b=L;p=150}if((p|0)==150){}if((a[q]&1)!=0){xp(c[z>>2]|0)}c[x>>2]=21164;c[w>>2]=21184;q=m+4|0;c[q>>2]=21368;if((a[v]&1)!=0){xp(c[m+44>>2]|0)}c[q>>2]=21512;y=0;pa(166,u|0);if(!y){y=0;pa(242,t|0);if(!y){break g}else{y=0;p=500;break g}}else{y=0}f=Mb(-1,-1,0)|0;y=0;pa(242,t|0);if(!y){ua=f;nd(ua);return 0}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}else{y=0;Q=Mb(-1,-1,s|0)|0;b=L}}while(0);y=0;pa(242,sa|0);if(!y){p=118;break}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}}}while(0);if((p|0)==118){}else if((p|0)==500){ua=Mb(-1,-1,0)|0;nd(ua);return 0}if(!n){Oa(o|0)|0}p=25}}while(0);if((p|0)==48){y=0;pa(272,c[e>>2]|0);if(!y){m=1;g=0;p=511}else{y=0;p=24}}if((p|0)==24){Q=Mb(-1,-1,s|0)|0;b=L;p=25}else if((p|0)==511){if((a[j]&1)!=0){xp(c[l+8>>2]|0)}if((a[h]&1)==0){ua=(m|0)==1;ua=ua?g:0;i=f;return ua|0}xp(c[k+8>>2]|0);ua=(m|0)==1;ua=ua?g:0;i=f;return ua|0}if((p|0)==25){}if((a[j]&1)!=0){xp(c[l+8>>2]|0)}if((a[h]&1)!=0){xp(c[k+8>>2]|0)}if((b|0)!=(rc(s|0)|0)){ua=Q;db(ua|0)}h=yb(Q|0)|0;j=(y=0,Da(32,31136,14288)|0);A:do{if(!y){h=Ac[c[(c[h>>2]|0)+8>>2]&255](h)|0;h=(y=0,Da(32,j|0,h|0)|0);if(y){y=0;p=532;break}y=0;qa(84,g|0,h+(c[(c[h>>2]|0)-12>>2]|0)|0);if(y){y=0;p=532;break}j=(y=0,Da(54,g|0,30864)|0);do{if(!y){j=(y=0,Da(c[(c[j>>2]|0)+28>>2]|0,j|0,10)|0);if(y){y=0;break}y=0;pa(166,g|0);if(y){y=0;p=532;break A}y=0,Da(4,h|0,j|0)|0;if(y){y=0;p=532;break A}y=0,ra(80,h|0)|0;if(y){y=0;p=532;break A}Qa();i=f;return-1|0}else{y=0}}while(0);f=Mb(-1,-1)|0;y=0;pa(166,g|0);if(!y){break}else{y=0}ua=Mb(-1,-1,0)|0;nd(ua);return 0}else{y=0;p=532}}while(0);if((p|0)==532){f=Mb(-1,-1)|0;}y=0;Ia(6);if(!y){ua=f;db(ua|0)}else{y=0;ua=Mb(-1,-1,0)|0;nd(ua);return 0}return 0}function td(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;i=i+40|0;m=f|0;k=f+8|0;h=f+16|0;j=f+24|0;l=f+32|0;a[k]=d;n=h|0;a[n]=0;c[h+4>>2]=b;d=b;o=c[(c[d>>2]|0)-12>>2]|0;g=b;a:do{if((c[g+(o+16)>>2]|0)==0){o=c[g+(o+72)>>2]|0;if((o|0)!=0){y=0,ra(80,o|0)|0;if(y){y=0;e=15;break}}a[n]=1;q=c[(c[d>>2]|0)-12>>2]|0;c[j>>2]=c[g+(q+24)>>2];o=g+q|0;p=k+1|0;n=(c[g+(q+4)>>2]&176|0)==32?p:k;q=g+(q+76)|0;s=c[q>>2]|0;r=s&255;b:do{if((s|0)==-1){y=0;qa(84,m|0,o|0);if(y){y=0;e=16;break}r=(y=0,Da(54,m|0,30864)|0);do{if(!y){r=(y=0,Da(c[(c[r>>2]|0)+28>>2]|0,r|0,32)|0);if(y){y=0;break}y=0;pa(166,m|0);if(y){y=0;e=16;break b}c[q>>2]=r<<24>>24;e=12;break b}else{y=0}}while(0);j=Mb(-1,-1,0)|0;y=0;pa(166,m|0);if(!y){break}else{y=0}s=Mb(-1,-1,0)|0;nd(s);return 0}else{e=12}}while(0);do{if((e|0)==12){y=0;za(46,l|0,j|0,k|0,n|0,p|0,o|0,r|0);if(y){y=0;e=16;break}if((c[l>>2]|0)!=0){e=18;break a}s=c[(c[d>>2]|0)-12>>2]|0;y=0;qa(90,g+s|0,c[g+(s+16)>>2]|5|0);if(!y){e=18;break a}else{y=0;e=16}}}while(0);if((e|0)==16){j=Mb(-1,-1,0)|0;}y=0;pa(262,h|0);if(!y){break}else{y=0}s=Mb(-1,-1,0)|0;nd(s);return 0}else{e=18}}while(0);do{if((e|0)==18){y=0;pa(262,h|0);if(y){y=0;e=15;break}i=f;return b|0}}while(0);if((e|0)==15){j=Mb(-1,-1,0)|0;}yb(j|0)|0;y=0;pa(162,g+(c[(c[d>>2]|0)-12>>2]|0)|0);if(!y){Qa();i=f;return b|0}else{y=0}e=Mb(-1,-1)|0;y=0;Ia(6);if(!y){db(e|0)}else{y=0;s=Mb(-1,-1,0)|0;nd(s);return 0}return 0}function ud(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;i=i+16|0;m=d;d=i;i=i+4|0;i=i+7&-8;c[d>>2]=c[m>>2];m=k|0;d=d|0;l=c[d>>2]|0;if((l|0)==0){c[b>>2]=0;i=k;return}p=e;n=g-p|0;h=h+12|0;o=c[h>>2]|0;n=(o|0)>(n|0)?o-n|0:0;o=f;p=o-p|0;do{if((p|0)>0){if((Cc[c[(c[l>>2]|0)+48>>2]&127](l,e,p)|0)==(p|0)){break}c[d>>2]=0;c[b>>2]=0;i=k;return}}while(0);do{if((n|0)>0){if(n>>>0<11>>>0){q=n<<1&255;e=m;a[e]=q;p=m+1|0}else{q=n+16&-16;p=vp(q)|0;c[m+8>>2]=p;q=q|1;c[m>>2]=q;c[m+4>>2]=n;q=q&255;e=m}Pp(p|0,j|0,n|0)|0;a[p+n|0]=0;if((q&1)==0){j=m+1|0}else{j=c[m+8>>2]|0}j=(y=0,ta(c[(c[l>>2]|0)+48>>2]|0,l|0,j|0,n|0)|0);if(y){y=0;p=Mb(-1,-1)|0;if((a[e]&1)==0){db(p|0)}xp(c[m+8>>2]|0);db(p|0)}if((j|0)==(n|0)){if((a[e]&1)==0){break}xp(c[m+8>>2]|0);break}c[d>>2]=0;c[b>>2]=0;if((a[e]&1)==0){i=k;return}xp(c[m+8>>2]|0);i=k;return}}while(0);m=g-o|0;do{if((m|0)>0){if((Cc[c[(c[l>>2]|0)+48>>2]&127](l,f,m)|0)==(m|0)){break}c[d>>2]=0;c[b>>2]=0;i=k;return}}while(0);c[h>>2]=0;c[b>>2]=l;i=k;return}function vd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b;f=c[d+48>>2]|0;if((f&16|0)!=0){g=d+44|0;h=c[g>>2]|0;f=c[d+24>>2]|0;if(h>>>0<f>>>0){c[g>>2]=f}else{f=h}g=c[d+20>>2]|0;d=g;h=f-d|0;if(h>>>0>4294967279>>>0){Tg(0)}if(h>>>0<11>>>0){a[e]=h<<1;b=b+1|0}else{i=h+16&-16;e=vp(i)|0;c[b+8>>2]=e;c[b>>2]=i|1;c[b+4>>2]=h;b=e}if((g|0)!=(f|0)){e=f+(-d|0)|0;d=b;while(1){a[d]=a[g]|0;g=g+1|0;if((g|0)==(f|0)){break}else{d=d+1|0}}b=b+e|0}a[b]=0;return}if((f&8|0)==0){Pp(e|0,0,12)|0;return}g=c[d+8>>2]|0;f=c[d+16>>2]|0;d=g;h=f-d|0;if(h>>>0>4294967279>>>0){Tg(0)}if(h>>>0<11>>>0){a[e]=h<<1;b=b+1|0}else{e=h+16&-16;i=vp(e)|0;c[b+8>>2]=i;c[b>>2]=e|1;c[b+4>>2]=h;b=i}if((g|0)!=(f|0)){d=f+(-d|0)|0;e=b;while(1){a[e]=a[g]|0;g=g+1|0;if((g|0)==(f|0)){break}else{e=e+1|0}}b=b+d|0}a[b]=0;return}function wd(b){b=b|0;var d=0,e=0;c[b>>2]=21164;c[b+56>>2]=21184;d=b+4|0;c[d>>2]=21368;if((a[b+36|0]&1)!=0){xp(c[b+44>>2]|0)}c[d>>2]=21512;y=0;pa(166,b+8|0);if(y){y=0;d=Mb(-1,-1)|0;y=0;pa(242,b+56|0);if(!y){e=b;xp(e);db(d|0)}else{y=0;e=Mb(-1,-1,0)|0;nd(e)}}y=0;pa(242,b+56|0);if(!y){xp(b);return}else{y=0}e=Mb(-1,-1)|0;d=b;xp(d);db(e|0)}function xd(b){b=b|0;var d=0,e=0,f=0;d=b;f=c[(c[b>>2]|0)-12>>2]|0;c[d+f>>2]=21164;b=d+(f+56)|0;c[b>>2]=21184;e=d+(f+4)|0;c[e>>2]=21368;if((a[d+(f+36)|0]&1)!=0){xp(c[d+(f+44)>>2]|0)}c[e>>2]=21512;y=0;pa(166,d+(f+8)|0);if(!y){rh(b);return}else{y=0}d=Mb(-1,-1)|0;y=0;pa(242,b|0);if(!y){db(d|0)}else{y=0;f=Mb(-1,-1,0)|0;nd(f)}}function yd(b){b=b|0;var d=0,e=0,f=0,g=0;d=b;g=c[(c[b>>2]|0)-12>>2]|0;b=d+g|0;c[b>>2]=21164;e=d+(g+56)|0;c[e>>2]=21184;f=d+(g+4)|0;c[f>>2]=21368;if((a[d+(g+36)|0]&1)!=0){xp(c[d+(g+44)>>2]|0)}c[f>>2]=21512;y=0;pa(166,d+(g+8)|0);if(y){y=0;d=Mb(-1,-1)|0;y=0;pa(242,e|0);if(!y){g=d;xp(b);db(g|0)}else{y=0;g=Mb(-1,-1,0)|0;nd(g)}}y=0;pa(242,e|0);if(!y){xp(b);return}else{y=0}g=Mb(-1,-1)|0;xp(b);db(g|0)}function zd(b){b=b|0;var d=0;d=b|0;c[d>>2]=21368;if((a[b+32|0]&1)!=0){xp(c[b+40>>2]|0)}c[d>>2]=21512;Dm(b+4|0);return}function Ad(b){b=b|0;var d=0;d=b|0;c[d>>2]=21368;if((a[b+32|0]&1)!=0){xp(c[b+40>>2]|0)}c[d>>2]=21512;y=0;pa(166,b+4|0);if(!y){xp(b);return}else{y=0;d=Mb(-1,-1)|0;xp(b);db(d|0)}}function Bd(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0;m=d+44|0;k=c[m>>2]|0;i=d+24|0;j=c[i>>2]|0;if(k>>>0<j>>>0){c[m>>2]=j;k=j}m=h&24;do{if((m|0)==0){m=b;c[m>>2]=0;c[m+4>>2]=0;m=b+8|0;c[m>>2]=-1;c[m+4>>2]=-1;return}else if((m|0)==24){if((g|0)==0){g=0;m=0;break}else if((g|0)==2){l=11;break}else if((g|0)!=1){l=15;break}m=b;c[m>>2]=0;c[m+4>>2]=0;m=b+8|0;c[m>>2]=-1;c[m+4>>2]=-1;return}else{if((g|0)==0){g=0;m=0;break}else if((g|0)==2){l=11;break}else if((g|0)!=1){l=15;break}if((h&8|0)==0){m=j-(c[d+20>>2]|0)|0;g=(m|0)<0|0?-1:0;break}else{m=(c[d+12>>2]|0)-(c[d+8>>2]|0)|0;g=(m|0)<0|0?-1:0;break}}}while(0);if((l|0)==15){m=b;c[m>>2]=0;c[m+4>>2]=0;m=b+8|0;c[m>>2]=-1;c[m+4>>2]=-1;return}if((l|0)==11){l=d+32|0;if((a[l]&1)==0){l=l+1|0}else{l=c[d+40>>2]|0}m=k-l|0;g=(m|0)<0|0?-1:0}f=Tp(m,g,e,f)|0;e=L;m=0;do{if(!((e|0)<(m|0)|(e|0)==(m|0)&f>>>0<0>>>0)){l=d+32|0;if((a[l]&1)==0){l=l+1|0}else{l=c[d+40>>2]|0}l=k-l|0;m=(l|0)<0|0?-1:0;if((m|0)<(e|0)|(m|0)==(e|0)&l>>>0<f>>>0){break}l=h&8;do{if(!((f|0)==0&(e|0)==0)){do{if((l|0)!=0){if((c[d+12>>2]|0)!=0){break}m=b;c[m>>2]=0;c[m+4>>2]=0;m=b+8|0;c[m>>2]=-1;c[m+4>>2]=-1;return}}while(0);if(!((h&16|0)!=0&(j|0)==0)){break}m=b;c[m>>2]=0;c[m+4>>2]=0;m=b+8|0;c[m>>2]=-1;c[m+4>>2]=-1;return}}while(0);if((l|0)!=0){c[d+12>>2]=(c[d+8>>2]|0)+f;c[d+16>>2]=k}if((h&16|0)!=0){c[i>>2]=(c[d+20>>2]|0)+f}m=b;c[m>>2]=0;c[m+4>>2]=0;m=b+8|0;c[m>>2]=f;c[m+4>>2]=e;return}}while(0);m=b;c[m>>2]=0;c[m+4>>2]=0;m=b+8|0;c[m>>2]=-1;c[m+4>>2]=-1;return}function Cd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=d;d=i;i=i+16|0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];c[d+8>>2]=c[g+8>>2];c[d+12>>2]=c[g+12>>2];d=d+8|0;Gc[c[(c[b>>2]|0)+16>>2]&63](a,b,c[d>>2]|0,c[d+4>>2]|0,0,e);i=f;return}function Dd(a){a=a|0;var b=0,e=0,f=0;e=a+44|0;f=c[e>>2]|0;b=c[a+24>>2]|0;if(f>>>0<b>>>0){c[e>>2]=b}else{b=f}if((c[a+48>>2]&8|0)==0){f=-1;return f|0}e=a+16|0;f=c[e>>2]|0;a=c[a+12>>2]|0;if(f>>>0<b>>>0){c[e>>2]=b}else{b=f}if(a>>>0>=b>>>0){f=-1;return f|0}f=d[a]|0;return f|0}function Ed(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;f=b+44|0;e=c[f>>2]|0;h=c[b+24>>2]|0;if(e>>>0<h>>>0){c[f>>2]=h}else{h=e}f=b+8|0;g=c[f>>2]|0;e=b+12|0;i=c[e>>2]|0;if(g>>>0>=i>>>0){i=-1;return i|0}if((d|0)==-1){c[f>>2]=g;c[e>>2]=i-1;c[b+16>>2]=h;i=0;return i|0}i=i-1|0;do{if((c[b+48>>2]&16|0)==0){if((d<<24>>24|0)==(a[i]|0)){break}else{b=-1}return b|0}}while(0);c[f>>2]=g;c[e>>2]=i;c[b+16>>2]=h;a[i]=d;i=d;return i|0}function Fd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;if((d|0)==-1){v=0;return v|0}g=b|0;f=b+12|0;i=b+8|0;e=(c[f>>2]|0)-(c[i>>2]|0)|0;h=b+24|0;m=c[h>>2]|0;k=b+28|0;l=c[k>>2]|0;a:do{if((m|0)==(l|0)){j=b+48|0;if((c[j>>2]&16|0)==0){v=-1;return v|0}l=b+20|0;o=c[l>>2]|0;n=m-o|0;m=b+44|0;o=(c[m>>2]|0)-o|0;q=b+32|0;p=q;r=q;u=a[r]|0;if((u&1)==0){t=(u&255)>>>1;v=10}else{t=c[b+36>>2]|0;v=(c[q>>2]&-2)-1|0}do{if((t|0)==(v|0)){y=0;za(26,q|0,v|0,1,v|0,v|0,0,0);if(y){y=0;break}u=a[r]|0;s=11}else{s=11}}while(0);b:do{if((s|0)==11){if((u&1)==0){a[r]=(t<<1)+2;s=p+1|0;u=t+1|0}else{s=c[b+40>>2]|0;u=t+1|0;c[b+36>>2]=u}a[s+t|0]=0;a[s+u|0]=0;t=a[r]|0;if((t&1)==0){s=10}else{t=c[q>>2]|0;s=(t&-2)-1|0;t=t&255}u=t&255;if((u&1|0)==0){u=u>>>1}else{u=c[b+36>>2]|0}do{if(u>>>0<s>>>0){v=s-u|0;y=0,ta(22,q|0,v|0,0)|0;if(y){y=0;break b}}else{if((t&1)==0){a[p+1+s|0]=0;a[r]=s<<1;break}else{a[(c[b+40>>2]|0)+s|0]=0;c[b+36>>2]=s;break}}}while(0);q=a[r]|0;if((q&1)==0){p=p+1|0}else{p=c[b+40>>2]|0}q=q&255;if((q&1|0)==0){q=q>>>1}else{q=c[b+36>>2]|0}v=p+q|0;c[l>>2]=p;c[k>>2]=v;k=p+n|0;c[h>>2]=k;n=p+o|0;c[m>>2]=n;l=v;break a}}while(0);v=Mb(-1,-1,0)|0;yb(v|0)|0;Qa();v=-1;return v|0}else{k=m;n=c[b+44>>2]|0;j=b+48|0}}while(0);m=k+1|0;n=m>>>0<n>>>0?n:m;c[b+44>>2]=n;if((c[j>>2]&8|0)!=0){j=b+32|0;if((a[j]&1)==0){j=j+1|0}else{j=c[b+40>>2]|0}c[i>>2]=j;c[f>>2]=j+e;c[b+16>>2]=n}if((k|0)==(l|0)){v=Mc[c[(c[b>>2]|0)+52>>2]&63](g,d&255)|0;return v|0}else{c[h>>2]=m;a[k]=d;v=d&255;return v|0}return 0}function Gd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b+32|0;Zg(e,d)|0;f=b+44|0;c[f>>2]=0;d=b+48|0;g=c[d>>2]|0;if((g&8|0)!=0){h=e;k=a[e]|0;i=(k&1)==0;if(i){j=h+1|0}else{j=c[b+40>>2]|0}k=k&255;if((k&1|0)==0){k=k>>>1}else{k=c[b+36>>2]|0}j=j+k|0;c[f>>2]=j;if(i){i=h+1|0;h=h+1|0}else{h=c[b+40>>2]|0;i=h}c[b+8>>2]=h;c[b+12>>2]=i;c[b+16>>2]=j}if((g&16|0)==0){return}h=e;i=e;j=a[i]|0;g=j&255;if((g&1|0)==0){g=g>>>1}else{g=c[b+36>>2]|0}if((j&1)==0){c[f>>2]=h+1+g;f=10}else{c[f>>2]=(c[b+40>>2]|0)+g;j=c[e>>2]|0;f=(j&-2)-1|0;j=j&255}k=j&255;if((k&1|0)==0){k=k>>>1}else{k=c[b+36>>2]|0}do{if(k>>>0<f>>>0){ah(e,f-k|0,0)|0}else{if((j&1)==0){a[h+1+f|0]=0;a[i]=f<<1;break}else{a[(c[b+40>>2]|0)+f|0]=0;c[b+36>>2]=f;break}}}while(0);i=a[i]|0;if((i&1)==0){e=h+1|0;f=h+1|0}else{f=c[b+40>>2]|0;e=f}h=i&255;if((h&1|0)==0){h=h>>>1}else{h=c[b+36>>2]|0}i=b+24|0;c[i>>2]=f;c[b+20>>2]=f;c[b+28>>2]=e+h;if((c[d>>2]&3|0)==0){return}c[i>>2]=f+g;return}function Hd(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;f=b|0;c[f>>2]=0;i=b+4|0;c[i>>2]=0;b=ae(12520,0,0,0)|0;c[f>>2]=b;if((b|0)==0){g=lc(16)|0;j=(y=0,ra(130,48)|0);do{if(!y){Np(j|0,12400,32)|0;a[j+32|0]=0;c[g>>2]=22400;h=(y=0,ra(130,48)|0);if(y){y=0;e=Mb(-1,-1)|0;xp(j);break}c[g+12>>2]=h;c[g+4>>2]=49;c[g+8>>2]=32;Np(h|0,j|0,32)|0;a[h+32|0]=0;y=0;Ha(16,g|0,27184,6);if(y){y=0}h=Mb(-1,-1)|0;xp(j);j=h;db(j|0)}else{y=0;e=Mb(-1,-1)|0;}}while(0);kb(g|0);j=e;db(j|0)}j=Sd(b)|0;c[i>>2]=j;if((j|0)!=0){return}fe(f,0);e=lc(16)|0;f=(y=0,ra(130,48)|0);do{if(!y){Np(f|0,12320,33)|0;a[f+33|0]=0;c[e>>2]=22400;b=(y=0,ra(130,48)|0);if(y){y=0;d=Mb(-1,-1)|0;xp(f);break}c[e+12>>2]=b;c[e+4>>2]=49;c[e+8>>2]=33;Np(b|0,f|0,33)|0;a[b+33|0]=0;y=0;Ha(16,e|0,27184,6);if(y){y=0}j=Mb(-1,-1)|0;xp(f);db(j|0)}else{y=0;d=Mb(-1,-1)|0;}}while(0);kb(e|0);j=d;db(j|0)}function Id(b){b=b|0;c[b>>2]=22400;if((a[b+4|0]&1)!=0){xp(c[b+12>>2]|0)}xp(b);return}function Jd(b){b=b|0;var d=0;d=b+4|0;if((a[d]&1)==0){d=d+1|0;return d|0}else{d=c[b+12>>2]|0;return d|0}return 0}function Kd(a,b,c){a=a|0;b=b|0;c=c|0;c=c&7;if(!((c|0)==4|(c|0)==2)){c=1}Nd(a,(c&6|0)==0?b:b+8|0,(c&1|0)!=0);if((c&2|0)!=0){Ld(a,b);return}if((c&4|0)==0){return}Md(a,b);return}function Ld(b,c){b=b|0;c=c|0;var d=0;d=a[c]|0;a[b+3|0]=d&15|d<<4;a[b+7|0]=d&-16|(d&255)>>>4;d=a[c+1|0]|0;a[b+11|0]=d&15|d<<4;a[b+15|0]=d&-16|(d&255)>>>4;d=a[c+2|0]|0;a[b+19|0]=d&15|d<<4;a[b+23|0]=d&-16|(d&255)>>>4;d=a[c+3|0]|0;a[b+27|0]=d&15|d<<4;a[b+31|0]=d&-16|(d&255)>>>4;d=a[c+4|0]|0;a[b+35|0]=d&15|d<<4;a[b+39|0]=d&-16|(d&255)>>>4;d=a[c+5|0]|0;a[b+43|0]=d&15|d<<4;a[b+47|0]=d&-16|(d&255)>>>4;d=a[c+6|0]|0;a[b+51|0]=d&15|d<<4;a[b+55|0]=d&-16|(d&255)>>>4;c=a[c+7|0]|0;a[b+59|0]=c&15|c<<4;a[b+63|0]=c&-16|(c&255)>>>4;return}function Md(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;i=i+24|0;e=d|0;f=d+8|0;k=a[c]|0;h=k&255;j=a[c+1|0]|0;g=j&255;a[e|0]=k;a[e+1|0]=j;if((k&255)>>>0>(j&255)>>>0){a[e+2|0]=(((h*6|0)+g|0)>>>0)/7|0;a[e+3|0]=(((h*5|0)+(g<<1)|0)>>>0)/7|0;a[e+4|0]=(((h<<2)+(g*3|0)|0)>>>0)/7|0;a[e+5|0]=(((h*3|0)+(g<<2)|0)>>>0)/7|0;a[e+6|0]=(((h<<1)+(g*5|0)|0)>>>0)/7|0;a[e+7|0]=((h+(g*6|0)|0)>>>0)/7|0}else{a[e+2|0]=(((h<<2)+g|0)>>>0)/5|0;a[e+3|0]=(((h*3|0)+(g<<1)|0)>>>0)/5|0;a[e+4|0]=(((h<<1)+(g*3|0)|0)>>>0)/5|0;a[e+5|0]=((h+(g<<2)|0)>>>0)/5|0;a[e+6|0]=0;a[e+7|0]=-1}g=a[c+2|0]|0;k=a[c+3|0]|0;j=(k&255)<<8;l=a[c+4|0]|0;h=g&7;a[f|0]=h;a[f+1|0]=(g&255)>>>3&7;a[f+2|0]=(j|g&255)>>>6&7;a[f+3|0]=(k&255)>>>1&7;a[f+4|0]=(k&255)>>>4&7;a[f+5|0]=((l&255)<<16|j)>>>15&7;a[f+6|0]=(l&255)>>>2&7;a[f+7|0]=(l&255)>>>5;l=a[c+5|0]|0;j=a[c+6|0]|0;k=(j&255)<<8;g=a[c+7|0]|0;a[f+8|0]=l&7;a[f+9|0]=(l&255)>>>3&7;a[f+10|0]=(k|l&255)>>>6&7;a[f+11|0]=(j&255)>>>1&7;a[f+12|0]=(j&255)>>>4&7;a[f+13|0]=((g&255)<<16|k)>>>15&7;a[f+14|0]=(g&255)>>>2&7;a[f+15|0]=(g&255)>>>5;g=0;while(1){a[b+(g<<2|3)|0]=a[e+(h&255)|0]|0;h=g+1|0;if((h|0)>=16){break}g=h;h=a[f+h|0]|0}i=d;return}function Nd(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=i;i=i+32|0;f=h|0;g=h+16|0;l=a[c]|0;p=a[c+1|0]|0;n=p&255;q=n<<8|l&255;p=p&-8|(p&255)>>>5;a[f|0]=p;n=q>>>5<<2|n>>>1&3;a[f+1|0]=n;l=(l&255)>>>2&7|l<<3;a[f+2|0]=l;a[f+3|0]=-1;k=a[c+2|0]|0;o=a[c+3|0]|0;m=o&255;j=m<<8|k&255;o=o&-8|(o&255)>>>5;a[f+4|0]=o;m=j>>>5<<2|m>>>1&3;a[f+5|0]=m;k=(k&255)>>>2&7|k<<3;a[f+6|0]=k;a[f+7|0]=-1;j=q>>>0>j>>>0;if(j|e^1){q=p&255;p=o&255;a[f+8|0]=(((q<<1)+p|0)>>>0)/3|0;a[f+12|0]=(((p<<1)+q|0)>>>0)/3|0;q=n&255;p=m&255;a[f+9|0]=(((q<<1)+p|0)>>>0)/3|0;a[f+13|0]=(((p<<1)+q|0)>>>0)/3|0;q=l&255;p=k&255;a[f+10|0]=(((q<<1)+p|0)>>>0)/3|0;a[f+14|0]=(((p<<1)+q|0)>>>0)/3|0}else{a[f+8|0]=((o&255)+(p&255)|0)>>>1;a[f+12|0]=0;a[f+9|0]=((m&255)+(n&255)|0)>>>1;a[f+13|0]=0;a[f+10|0]=((k&255)+(l&255)|0)>>>1;a[f+14|0]=0}a[f+11|0]=-1;a[f+15|0]=e?j<<31>>31:-1;j=a[c+4|0]|0;k=j&3;a[g|0]=k;a[g+1|0]=(j&255)>>>2&3;a[g+2|0]=(j&255)>>>4&3;a[g+3|0]=(j&255)>>>6;j=a[c+5|0]|0;a[g+4|0]=j&3;a[g+5|0]=(j&255)>>>2&3;a[g+6|0]=(j&255)>>>4&3;a[g+7|0]=(j&255)>>>6;j=a[c+6|0]|0;a[g+8|0]=j&3;a[g+9|0]=(j&255)>>>2&3;a[g+10|0]=(j&255)>>>4&3;a[g+11|0]=(j&255)>>>6;j=a[c+7|0]|0;a[g+12|0]=j&3;a[g+13|0]=(j&255)>>>2&3;a[g+14|0]=(j&255)>>>4&3;a[g+15|0]=(j&255)>>>6;j=0;while(1){q=f+(k<<2&255)|0;k=b+(j<<2)|0;D=d[q]|d[q+1|0]<<8|d[q+2|0]<<16|d[q+3|0]<<24|0;a[k]=D;D=D>>8;a[k+1|0]=D;D=D>>8;a[k+2|0]=D;D=D>>8;a[k+3|0]=D;k=j+1|0;if((k|0)>=16){break}j=k;k=a[g+k|0]|0}i=h;return}function Od(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=a;g=a+200|0;f=c[g>>2]|0;if((a|0)==0){a=0;return a|0}if((4294967295/(d>>>0)|0)>>>0<b>>>0){we(e,17064);a=0;return a|0}else{a=ha(d,b)|0;c[g>>2]=f|1048576;a=qe(e,a)|0;c[g>>2]=f;return a|0}return 0}function Pd(a,b){a=a|0;b=b|0;re(a,b);return}function Qd(a){a=a|0;c[a+364>>2]=vf(0,0,0)|0;return}function Rd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=c[b+200>>2]|0;do{if((a[b+376|0]&32)==0){if((f&2048|0)==0){break}return}else{if((f&768|0)!=768){break}return}}while(0);f=b+364|0;c[f>>2]=vf(c[f>>2]|0,d,e)|0;return}function Sd(a){a=a|0;var b=0;if((a|0)==0){b=0;return b|0}b=ne(2,c[a+676>>2]|0,c[a+672>>2]|0)|0;a=b;if((b|0)==0){b=a;return b|0}Pp(b|0,0,288)|0;b=a;return b|0}function Td(e,f,g,h){e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0;if((e|0)==0|(f|0)==0){return}i=f+184|0;do{if((g&16384&c[i>>2]|0)!=0){if((h|0)==-1){j=f+48|0;if((c[j>>2]|0)>0){k=0;do{Td(e,f,16384,k);k=k+1|0;}while((k|0)<(c[j>>2]|0))}m=f+56|0;re(e,c[m>>2]|0);c[m>>2]=0;c[j>>2]=0;break}else{j=f+56|0;k=c[j>>2]|0;if((k|0)==0){break}k=c[k+(h<<4)+4>>2]|0;if((k|0)==0){break}re(e,k);c[(c[j>>2]|0)+(h<<4)+4>>2]=0;break}}}while(0);j=c[i>>2]|0;if((g&8192&j|0)!=0){j=f+76|0;re(e,c[j>>2]|0);c[j>>2]=0;j=f+8|0;c[j>>2]=c[j>>2]&-17;j=c[i>>2]|0}if((g&256&j|0)!=0){m=f+8|0;c[m>>2]=c[m>>2]&-16385}if((g&128&j|0)!=0){m=f+160|0;re(e,c[m>>2]|0);j=f+172|0;re(e,c[j>>2]|0);c[m>>2]=0;c[j>>2]=0;j=f+176|0;m=c[j>>2]|0;if((m|0)!=0){k=f+181|0;if((a[k]|0)!=0){l=0;do{re(e,c[m+(l<<2)>>2]|0);c[(c[j>>2]|0)+(l<<2)>>2]=0;l=l+1|0;m=c[j>>2]|0}while((l|0)<(d[k]|0))}re(e,m);c[j>>2]=0}j=f+8|0;c[j>>2]=c[j>>2]&-1025;j=c[i>>2]|0}if((g&16&j|0)!=0){m=f+196|0;re(e,c[m>>2]|0);j=f+200|0;re(e,c[j>>2]|0);c[m>>2]=0;c[j>>2]=0;j=f+8|0;c[j>>2]=c[j>>2]&-4097;j=c[i>>2]|0}do{if((g&32&j|0)!=0){if((h|0)!=-1){k=f+212|0;j=c[k>>2]|0;if((j|0)==0){break}re(e,c[j+(h<<4)>>2]|0);re(e,c[(c[k>>2]|0)+(h<<4)+8>>2]|0);c[(c[k>>2]|0)+(h<<4)>>2]=0;c[(c[k>>2]|0)+(h<<4)+8>>2]=0;break}j=f+216|0;k=c[j>>2]|0;if((k|0)!=0){if((k|0)>0){k=0;do{Td(e,f,32,k);k=k+1|0;}while((k|0)<(c[j>>2]|0))}m=f+212|0;re(e,c[m>>2]|0);c[m>>2]=0;c[j>>2]=0}m=f+8|0;c[m>>2]=c[m>>2]&-8193}}while(0);k=e+720|0;j=c[k>>2]|0;if((j|0)!=0){re(e,j);c[k>>2]=0}do{if((g&512&c[i>>2]|0)!=0){if((h|0)!=-1){k=f+188|0;j=c[k>>2]|0;if((j|0)==0){break}re(e,c[j+(h*20|0)+8>>2]|0);c[(c[k>>2]|0)+(h*20|0)+8>>2]=0;break}j=f+192|0;k=c[j>>2]|0;if((k|0)==0){break}if((k|0)>0){k=0;do{Td(e,f,512,k);k=k+1|0;}while((k|0)<(c[j>>2]|0))}m=f+188|0;re(e,c[m>>2]|0);c[m>>2]=0;c[j>>2]=0}}while(0);j=c[i>>2]|0;if((g&8&j|0)!=0){j=f+124|0;re(e,c[j>>2]|0);c[j>>2]=0;j=f+8|0;c[j>>2]=c[j>>2]&-65;j=c[i>>2]|0}if((g&4096&j|0)!=0){j=f+16|0;re(e,c[j>>2]|0);c[j>>2]=0;j=f+8|0;c[j>>2]=c[j>>2]&-9;b[f+20>>1]=0;j=c[i>>2]|0}if((g&64&j|0)!=0){j=f+248|0;m=c[j>>2]|0;if((m|0)!=0){k=f+4|0;if((c[k>>2]|0)>0){l=0;do{re(e,c[m+(l<<2)>>2]|0);c[(c[j>>2]|0)+(l<<2)>>2]=0;l=l+1|0;m=c[j>>2]|0}while((l|0)<(c[k>>2]|0))}re(e,m);c[j>>2]=0}m=f+8|0;c[m>>2]=c[m>>2]&-32769}if((h|0)==-1){c[i>>2]=c[i>>2]&~g;return}else{c[i>>2]=c[i>>2]&((g|16928)^-16929);return}}function Ud(a,b){a=a|0;b=b|0;if((a|0)==0){return}c[a+176>>2]=b;return}function Vd(a,b){a=a|0;b=b|0;var e=0,f=0,g=0;if((a|0)==0|(b|0)==0){g=0;return g|0}g=c[a+636>>2]|0;if((g|0)<1){g=0;return g|0}f=g;a=(c[a+640>>2]|0)+((g*5|0)-5)|0;while(1){if((Qp(b|0,a|0,4)|0)==0){break}f=f-1|0;if((f|0)==0){b=0;e=7;break}else{a=a-5|0}}if((e|0)==7){return b|0}g=d[a+4|0]|0;return g|0}function Wd(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0;if((a|0)==0){j=0;return j|0}if((b|0)<0|(c|0)<1|(d|0)<0|(e|0)<0|(f|0)<0|(g|0)<0|(h|0)<0|(i|0)<0){we(a,12080);j=0}else{j=1}if((1e5-c|0)<(b|0)){we(a,11528);j=0}if((1e5-e|0)<(d|0)){we(a,18240);j=0}if((1e5-g|0)<(f|0)){we(a,17800);j=0}if((1e5-i|0)<(h|0)){we(a,17440);j=0}l=f-d|0;b=i-e|0;k=l>>>16;i=l&65535;l=b>>>16;b=b&65535;f=ha(b,i)|0;i=(ha(b,k)|0)+(ha(l,i)|0)+(f>>>16)|0;b=g-e|0;d=h-d|0;g=b>>>16;b=b&65535;e=d>>>16;d=d&65535;c=ha(d,b)|0;b=(ha(d,g)|0)+(ha(e,b)|0)+(c>>>16)|0;if(!(((i>>>16)+(ha(l,k)|0)|0)==((b>>>16)+(ha(e,g)|0)|0)&(i<<16|f&65535|0)==(b<<16|c&65535|0))){l=j;return l|0}we(a,17104);l=0;return l|0}function Xd(b,d,e,f,g,h,i,j,k){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0;if((b|0)==0|(d|0)==0){return}if((e|0)==0|(f|0)==0){ve(b,13040)}if((c[b+704>>2]|0)>>>0<e>>>0){m=6}else{if((c[b+708>>2]|0)>>>0<f>>>0){m=6}}if((m|0)==6){ve(b,12480)}if((f|e|0)<0){ve(b,11968)}l=e>>>0>536870782>>>0;if(l){we(b,11888)}if((g-1|0)>>>0>1>>>0&(g|0)!=4&(g|0)!=8&(g|0)!=16){ve(b,11424)}if((h|0)<0|(h|0)==1|(h|0)==5|(h|0)>6){ve(b,18136)}do{if((h|0)==3&(g|0)>8){m=18}else{if(!((h|0)==6|(h|0)==4|(h|0)==2)){break}if((g|0)<8){m=18}}}while(0);if((m|0)==18){ve(b,17640)}if((i|0)>1){ve(b,17336)}if((j|0)!=0){ve(b,17024)}n=b+196|0;do{if((c[n>>2]&4096|0)!=0){if((c[b+652>>2]|0)==0){break}we(b,16864)}}while(0);do{if((k|0)!=0){do{if((c[b+652>>2]&4|0)!=0&(k|0)==64){o=c[n>>2]|0;if((o&4096|0)!=0){m=30;break}if((h&-5|0)!=2){m=30}}else{m=30}}while(0);if((m|0)==30){ve(b,16656);o=c[n>>2]|0}if((o&4096|0)==0){break}we(b,16488)}}while(0);c[d>>2]=e;c[d+4>>2]=f;m=g&255;a[d+24|0]=m;h=h&255;a[d+25|0]=h;a[d+26|0]=j;a[d+27|0]=k;a[d+28|0]=i;do{if(h<<24>>24==3){a[d+29|0]=1;k=1}else{if((h&2)==0){k=1;j=1}else{k=3;j=3}a[d+29|0]=j;if((h&4)==0){break}k=k+1&255;a[d+29|0]=k}}while(0);k=ha(m,k)|0;a[d+30|0]=k;if(l){c[d+12>>2]=0;return}l=k&255;if((k&255)>>>0>7>>>0){e=ha(l>>>3,e)|0}else{e=((ha(l,e)|0)+7|0)>>>3}c[d+12>>2]=e;return}function Yd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((a|0)==0|(b|0)==0){return}e=b+248|0;f=c[e>>2]|0;if(!((f|0)==0|(f|0)==(d|0))){Td(a,b,64,0)}c[e>>2]=d;if((d|0)==0){return}f=b+8|0;c[f>>2]=c[f>>2]|32768;return}function Zd(b,e){b=b|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)==0|(e|0)==0){return}f=b+196|0;if((c[f>>2]&1024|0)!=0){return}Ne(b);do{if((c[f>>2]&4096|0)!=0){h=b+652|0;if((c[h>>2]|0)==0){break}we(b,16768);c[h>>2]=0}}while(0);i=e+25|0;Pe(b,c[e>>2]|0,c[e+4>>2]|0,d[e+24|0]|0,d[i]|0,d[e+26|0]|0,d[e+27|0]|0,d[e+28|0]|0);h=e+8|0;j=c[h>>2]|0;if((j&1|0)!=0){Te(b,+g[e+40>>2]);j=c[h>>2]|0}if((j&2048|0)!=0){Ue(b,d[e+44|0]|0);j=c[h>>2]|0}if((j&4096|0)!=0){Ve(b,c[e+196>>2]|0,0,c[e+200>>2]|0,c[e+204>>2]|0);j=c[h>>2]|0}if((j&2|0)!=0){_e(b,e+68|0,d[i]|0);j=c[h>>2]|0}if((j&4|0)!=0){$e(b,+g[e+128>>2],+g[e+132>>2],+g[e+136>>2],+g[e+140>>2],+g[e+144>>2],+g[e+148>>2],+g[e+152>>2],+g[e+156>>2])}h=e+192|0;i=c[h>>2]|0;do{if((i|0)!=0){e=e+188|0;if((i|0)<=0){break}j=b+200|0;i=c[e>>2]|0;do{k=i|0;l=Vd(b,k)|0;do{if((l|0)!=1){m=a[i+16|0]|0;if(!(m<<24>>24!=0&(m&6)==0)){break}if(!((a[i+3|0]&32)!=0|(l|0)==3)){if((c[j>>2]&65536|0)==0){break}}l=i+12|0;m=c[l>>2]|0;if((m|0)==0){we(b,17744);m=c[l>>2]|0}Oe(b,k,c[i+8>>2]|0,m)}}while(0);i=i+20|0;}while(i>>>0<((c[e>>2]|0)+((c[h>>2]|0)*20|0)|0)>>>0)}}while(0);c[f>>2]=c[f>>2]|1024;return}function _d(f,g){f=f|0;g=g|0;var i=0,j=0,k=0,l=0,m=0,n=0;if((f|0)==0|(g|0)==0){return}Zd(f,g);i=g+8|0;do{if((c[i>>2]&8|0)==0){if((a[g+25|0]|0)!=3){break}ve(f,15984)}else{Qe(f,c[g+16>>2]|0,e[g+20>>1]|0)}}while(0);j=c[i>>2]|0;if((j&16|0)!=0){j=g+25|0;do{if((c[f+204>>2]&524288|0)!=0){if((a[j]|0)!=3){break}k=g+22|0;if((b[k>>1]|0)==0){break}l=g+76|0;m=0;do{n=(c[l>>2]|0)+m|0;a[n]=~a[n];m=m+1|0;}while((m|0)<(e[k>>1]|0))}}while(0);af(f,c[g+76>>2]|0,g+80|0,e[g+22>>1]|0,d[j]|0);j=c[i>>2]|0}if((j&32|0)!=0){bf(f,g+90|0,d[g+25|0]|0);j=c[i>>2]|0}if((j&64|0)!=0){cf(f,c[g+124>>2]|0,e[g+20>>1]|0);j=c[i>>2]|0}if((j&256|0)!=0){ff(f,c[g+100>>2]|0,c[g+104>>2]|0,d[g+108|0]|0);j=c[i>>2]|0}if((j&1024|0)!=0){gf(f,c[g+160>>2]|0,c[g+164>>2]|0,c[g+168>>2]|0,d[g+180|0]|0,d[g+181|0]|0,c[g+172>>2]|0,c[g+176>>2]|0);j=c[i>>2]|0}if((j&16384|0)!=0){hf(f,d[g+220|0]|0,+h[g+224>>3],+h[g+232>>3]);j=c[i>>2]|0}if((j&128|0)!=0){jf(f,c[g+112>>2]|0,c[g+116>>2]|0,d[g+120|0]|0);j=c[i>>2]|0}if((j&512|0)!=0){kf(f,g+60|0);j=f+196|0;c[j>>2]=c[j>>2]|512;j=c[i>>2]|0}do{if((j&8192|0)!=0){j=g+216|0;if((c[j>>2]|0)<=0){break}i=g+212|0;k=0;do{Ze(f,(c[i>>2]|0)+(k<<4)|0);k=k+1|0;}while((k|0)<(c[j>>2]|0))}}while(0);l=g+48|0;if((c[l>>2]|0)>0){m=g+56|0;k=0;do{j=c[m>>2]|0;i=c[j+(k<<4)>>2]|0;do{if((i|0)>0){we(f,14872);c[(c[m>>2]|0)+(k<<4)>>2]=-3}else{if((i|0)==0){ef(f,c[j+(k<<4)+4>>2]|0,c[j+(k<<4)+8>>2]|0,0,0);c[(c[m>>2]|0)+(k<<4)>>2]=-2;break}else if((i|0)==(-1|0)){df(f,c[j+(k<<4)+4>>2]|0,c[j+(k<<4)+8>>2]|0,0);c[(c[m>>2]|0)+(k<<4)>>2]=-3;break}else{break}}}while(0);k=k+1|0;}while((k|0)<(c[l>>2]|0))}i=g+192|0;j=c[i>>2]|0;if((j|0)==0){return}g=g+188|0;if((j|0)<=0){return}m=f+200|0;j=c[g>>2]|0;do{l=j|0;k=Vd(f,l)|0;do{if((k|0)!=1){n=a[j+16|0]|0;if(!(n<<24>>24!=0&(n&6)==2)){break}if(!((a[j+3|0]&32)!=0|(k|0)==3)){if((c[m>>2]&65536|0)==0){break}}Oe(f,l,c[j+8>>2]|0,c[j+12>>2]|0)}}while(0);j=j+20|0;}while(j>>>0<((c[g>>2]|0)+((c[i>>2]|0)*20|0)|0)>>>0);return}function $d(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;if((b|0)==0){return}e=b+196|0;if((c[e>>2]&4|0)==0){ve(b,13864)}do{if((d|0)!=0){do{if((c[d+8>>2]&512|0)!=0){if((c[e>>2]&512|0)!=0){break}kf(b,d+60|0)}}while(0);h=d+48|0;if((c[h>>2]|0)>0){i=d+56|0;f=0;do{j=c[i>>2]|0;g=c[j+(f<<4)>>2]|0;do{if((g|0)>0){we(b,14872);c[(c[i>>2]|0)+(f<<4)>>2]=-3}else{if((g|0)>-1){ef(b,c[j+(f<<4)+4>>2]|0,c[j+(f<<4)+8>>2]|0,0,g);c[(c[i>>2]|0)+(f<<4)>>2]=-2;break}if((g|0)!=-1){break}df(b,c[j+(f<<4)+4>>2]|0,c[j+(f<<4)+8>>2]|0,0);c[(c[i>>2]|0)+(f<<4)>>2]=-3}}while(0);f=f+1|0;}while((f|0)<(c[h>>2]|0))}f=d+192|0;g=c[f>>2]|0;if((g|0)==0){break}d=d+188|0;if((g|0)<=0){break}i=b+200|0;j=c[d>>2]|0;do{h=j|0;g=Vd(b,h)|0;do{if((g|0)!=1){k=a[j+16|0]|0;if(k<<24>>24==0|(k&8)==0){break}if(!((a[j+3|0]&32)!=0|(g|0)==3)){if((c[i>>2]&65536|0)==0){break}}Oe(b,h,c[j+8>>2]|0,c[j+12>>2]|0)}}while(0);j=j+20|0;}while(j>>>0<((c[d>>2]|0)+((c[f>>2]|0)*20|0)|0)>>>0)}}while(0);c[e>>2]=c[e>>2]|8;Se(b);return}function ae(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return be(a,b,c,d,0,0,0)|0}function be(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,A=0,B=0,C=0;s=i;i=i+80|0;B=1;m=0;l=i;i=i+168|0;c[l>>2]=0;while(1)switch(B|0){case 1:A=s|0;B=ta(52,1,h|0,g|0)|0;if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;n=B;if((n|0)==0){x=0;B=20;break}else{B=2;break};case 2:c[n+704>>2]=1e6;c[n+708>>2]=1e6;o=Rp(n|0,B,l)|0;B=21;break;case 21:p=n;if((o|0)==0){B=4;break}else{B=3;break};case 3:qa(118,p|0,c[n+264>>2]|0);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;c[n+264>>2]=0;pa(268,n|0);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;x=0;B=20;break;case 4:La(16,p|0,g|0,h|0,j|0);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;La(4,n|0,d|0,e|0,f|0);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;u=(b|0)!=0;if(u){q=0;B=5;break}else{B=8;break};case 5:B=a[b+q|0]|0;r=1864+q|0;if(B<<24>>24==(a[r]|0)){k=B;B=7;break}else{B=6;break};case 6:k=n+200|0;c[k>>2]=c[k>>2]|131072;k=a[r]|0;B=7;break;case 7:if(k<<24>>24==0){B=8;break}else{q=q+1|0;B=5;break};case 8:if((c[n+200>>2]&131072|0)==0){B=17;break}else{B=9;break};case 9:if((b|0)==0){B=14;break}else{B=10;break};case 10:t=a[b]|0;if(t<<24>>24==(a[1864]|0)){B=11;break}else{B=14;break};case 11:if((t<<24>>24|0)==49){B=12;break}else if((t<<24>>24|0)==48){B=13;break}else{B=17;break};case 12:if((a[b+2|0]|0)==(a[1866]|0)){B=17;break}else{B=14;break};case 13:if((a[b+2|0]|0)<57){B=14;break}else{B=17;break};case 14:v=A|0;if(u){B=15;break}else{B=16;break};case 15:Ka(8,v|0,80,13304,(B=i,i=i+8|0,c[B>>2]=b,B)|0)|0;if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;i=B;qa(14,n|0,v|0);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;B=16;break;case 16:Ka(8,v|0,80,12808,(B=i,i=i+8|0,c[B>>2]=1864,B)|0)|0;if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;i=B;qa(14,n|0,v|0);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;c[n+200>>2]=0;qa(10,n|0,12216);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;B=17;break;case 17:c[n+268>>2]=8192;C=Da(20,n|0,c[n+268>>2]|0)|0;if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;c[n+264>>2]=C;La(2,n|0,0,0,0);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;oa(6,n|0,0,1,0,0);if((y|0)!=0&(z|0)!=0){m=Sp(c[y>>2]|0,l)|0;if((m|0)>0){B=-1;break}else return 0}y=z=0;w=Rp(n|0,B,l)|0;B=22;break;case 22:if((w|0)==0){B=19;break}else{B=18;break};case 18:Ia(8);return 0;{}{}{}{};case 19:x=n;B=20;break;case 20:i=s;return x|0;case-1:if((m|0)==2){o=z;B=21}else if((m|0)==17){w=z;B=22}y=z=0;break}return 0}function ce(d,e,f,g,i){d=d|0;e=e|0;f=f|0;g=g|0;i=i|0;var j=0,k=0,l=0,m=0.0;if((d|0)==0){return}if((e|0)>2){we(d,16280);return}e=(e|0)==0?1:e;f=(f|0)<0|(g|0)==0|(e|0)==1?0:f;a[d+597|0]=f;a[d+596|0]=e;if((f|0)>0){e=d+600|0;a:do{if((c[e>>2]|0)==0){j=qe(d,f)|0;c[e>>2]=j;k=0;while(1){a[j+k|0]=-1;k=k+1|0;if((k|0)>=(f|0)){break a}j=c[e>>2]|0}}}while(0);e=d+604|0;if((c[e>>2]|0)==0){k=f<<1;c[e>>2]=qe(d,k)|0;j=d+608|0;c[j>>2]=qe(d,k)|0;k=0;do{b[(c[e>>2]|0)+(k<<1)>>1]=256;b[(c[j>>2]|0)+(k<<1)>>1]=256;k=k+1|0;}while((k|0)<(f|0))}j=d+608|0;k=0;do{l=g+(k<<3)|0;m=+h[l>>3];if(m<0.0){b[(c[e>>2]|0)+(k<<1)>>1]=256;b[(c[j>>2]|0)+(k<<1)>>1]=256}else{b[(c[j>>2]|0)+(k<<1)>>1]=~~(m*256.0+.5);b[(c[e>>2]|0)+(k<<1)>>1]=~~(256.0/+h[l>>3]+.5)}k=k+1|0;}while((k|0)<(f|0))}g=d+612|0;if((c[g>>2]|0)==0){c[g>>2]=qe(d,10)|0;f=d+616|0;c[f>>2]=qe(d,10)|0;b[c[g>>2]>>1]=8;b[c[f>>2]>>1]=8;b[(c[g>>2]|0)+2>>1]=8;b[(c[f>>2]|0)+2>>1]=8;b[(c[g>>2]|0)+4>>1]=8;b[(c[f>>2]|0)+4>>1]=8;b[(c[g>>2]|0)+6>>1]=8;b[(c[f>>2]|0)+6>>1]=8;b[(c[g>>2]|0)+8>>1]=8;b[(c[f>>2]|0)+8>>1]=8}else{f=d+616|0}if((i|0)==0){b[c[g>>2]>>1]=8;b[c[f>>2]>>1]=8;b[(c[g>>2]|0)+2>>1]=8;b[(c[f>>2]|0)+2>>1]=8;b[(c[g>>2]|0)+4>>1]=8;b[(c[f>>2]|0)+4>>1]=8;b[(c[g>>2]|0)+6>>1]=8;b[(c[f>>2]|0)+6>>1]=8;b[(c[g>>2]|0)+8>>1]=8;b[(c[f>>2]|0)+8>>1]=8;return}else{e=0}do{d=i+(e<<3)|0;m=+h[d>>3];do{if(m<0.0){b[(c[g>>2]|0)+(e<<1)>>1]=8;b[(c[f>>2]|0)+(e<<1)>>1]=8}else{if(m<1.0){break}b[(c[f>>2]|0)+(e<<1)>>1]=~~(8.0/m+.5);b[(c[g>>2]|0)+(e<<1)>>1]=~~(+h[d>>3]*8.0+.5)}}while(0);e=e+1|0;}while((e|0)<5);return}function de(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==0){return}f=b+320|0;do{if((c[f>>2]|0)==0){if((a[b+384|0]|0)!=0){break}if((c[b+196>>2]&1024|0)==0){ve(b,17544)}lf(b)}}while(0);i=b+383|0;a:do{if((a[i]|0)!=0){if((c[b+204>>2]&2|0)==0){break}switch(d[b+384|0]|0){case 5:{if((c[f>>2]&1|0)==0){if((c[b+292>>2]|0)>>>0>=2>>>0){break a}}mf(b);return};case 6:{if((c[f>>2]&1|0)!=0){break a}mf(b);return};case 0:{if((c[f>>2]&7|0)==0){break a}mf(b);return};case 1:{if((c[f>>2]&7|0)==0){if((c[b+292>>2]|0)>>>0>=5>>>0){break a}}mf(b);return};case 2:{if((c[f>>2]&7|0)==4){break a}mf(b);return};case 3:{if((c[f>>2]&3|0)==0){if((c[b+292>>2]|0)>>>0>=3>>>0){break a}}mf(b);return};case 4:{if((c[f>>2]&3|0)==2){break a}mf(b);return};default:{break a}}}}while(0);g=b+348|0;a[b+356|0]=a[b+386|0]|0;k=c[b+304>>2]|0;h=g|0;c[h>>2]=k;j=a[b+391|0]|0;a[b+358|0]=j;l=a[b+388|0]|0;a[b+357|0]=l;l=ha(j,l)|0;a[b+359|0]=l;j=l&255;if((l&255)>>>0>7>>>0){k=ha(j>>>3,k)|0}else{k=((ha(j,k)|0)+7|0)>>>3}c[b+352>>2]=k;j=b+328|0;te(b,(c[j>>2]|0)+1|0,e,k)|0;do{if((a[i]|0)!=0){i=a[b+384|0]|0;if((i&255)>>>0>=6>>>0){break}if((c[b+204>>2]&2|0)==0){break}nf(g,(c[j>>2]|0)+1|0,i&255);if((c[h>>2]|0)!=0){break}mf(b);return}}while(0);if((c[b+204>>2]|0)!=0){ie(b)}do{if((c[b+652>>2]&4|0)!=0){if((a[b+660|0]|0)!=64){break}me(g,(c[j>>2]|0)+1|0)}}while(0);of(b,g);g=c[b+504>>2]|0;if((g|0)==0){return}Qc[g&31](b,c[f>>2]|0,d[b+384|0]|0);return}function ee(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;if((a|0)==0){return}if((c[a+320>>2]|0)>>>0>=(c[a+300>>2]|0)>>>0){return}h=a+208|0;d=a+224|0;e=a+264|0;b=a+268|0;f=a+220|0;g=a+232|0;while(1){do{if((zf(h,2)|0)!=0){i=c[g>>2]|0;if((i|0)==0){ve(a,17256);break}else{ve(a,i);break}}}while(0);i=c[d>>2]|0;if((i|0)!=0){break}Re(a,c[e>>2]|0,c[b>>2]|0);c[f>>2]=c[e>>2];c[d>>2]=c[b>>2]}g=c[b>>2]|0;if((g|0)!=(i|0)){Re(a,c[e>>2]|0,g-i|0);c[f>>2]=c[e>>2];c[d>>2]=c[b>>2]}c[a+432>>2]=0;sf(a);return}function fe(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;if((a|0)==0){f=0;e=0;d=0;g=0}else{g=c[a>>2]|0;f=c[g+672>>2]|0;e=c[g+680>>2]|0;d=g;g=(g|0)!=0}do{if((b|0)!=0){h=c[b>>2]|0;if((h|0)==0){break}do{if(g){Td(d,h,32767,-1);i=d+636|0;if((c[i>>2]|0)==0){break}j=d+640|0;re(d,c[j>>2]|0);c[j>>2]=0;c[i>>2]=0}}while(0);pe(h,e,f);c[b>>2]=0}}while(0);if(!g){return}ge(d);pe(d,e,f);c[a>>2]=0;return}function ge(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;i=i+160|0;xf(a+208|0)|0;re(a,c[a+264>>2]|0);re(a,c[a+328>>2]|0);re(a,c[a+324>>2]|0);re(a,c[a+332>>2]|0);re(a,c[a+336>>2]|0);re(a,c[a+340>>2]|0);re(a,c[a+344>>2]|0);re(a,c[a+620>>2]|0);re(a,c[a+600>>2]|0);re(a,c[a+604>>2]|0);re(a,c[a+608>>2]|0);re(a,c[a+612>>2]|0);re(a,c[a+616>>2]|0);e=a;d=b|0;Np(d|0,e|0,156)|0;l=a+156|0;m=c[l>>2]|0;j=a+160|0;k=c[j>>2]|0;g=a+164|0;h=c[g>>2]|0;a=a+680|0;f=c[a>>2]|0;Pp(e|0,0,744)|0;c[l>>2]=m;c[j>>2]=k;c[g>>2]=h;c[a>>2]=f;Np(e|0,d|0,156)|0;i=b;return}function he(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;if((a|0)==0|(b|0)==0){return}if((d&1024|0)!=0){Ge(a)}_d(a,b);if((d&32|0)!=0){He(a)}do{if((d&64|0)!=0){if((c[b+8>>2]&2|0)==0){break}Ce(a,b+68|0)}}while(0);if((d&4|0)!=0){Ae(a)}if((d&256|0)!=0){Fe(a)}do{if((d&4096|0)==0){if((d&2048|0)==0){break}Ee(a,0,0)}else{Ee(a,0,1)}}while(0);if((d&128|0)!=0){ye(a)}if((d&512|0)!=0){ze(a)}if((d&8|0)!=0){Be(a)}do{if((c[b+8>>2]&32768|0)!=0){f=c[b+248>>2]|0;d=De(a)|0;if((d|0)<=0){break}e=a+296|0;g=0;j=c[e>>2]|0;do{if((j|0)==0){j=0}else{i=0;h=f;while(1){de(a,c[h>>2]|0);i=i+1|0;j=c[e>>2]|0;if(i>>>0<j>>>0){h=h+4|0}else{break}}}g=g+1|0;}while((g|0)<(d|0))}}while(0);$d(a,b);return}function ie(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((b|0)==0){return}e=b+204|0;g=c[e>>2]|0;do{if((g&1048576|0)!=0){f=c[b+184>>2]|0;if((f|0)==0){break}Qc[f&31](b,b+348|0,(c[b+328>>2]|0)+1|0);g=c[e>>2]|0}}while(0);if((g&32768|0)!=0){Le(b+348|0,(c[b+328>>2]|0)+1|0,c[b+200>>2]|0);g=c[e>>2]|0}if((g&65536|0)!=0){Ke(b+348|0,(c[b+328>>2]|0)+1|0);g=c[e>>2]|0}if((g&4|0)!=0){je(b+348|0,(c[b+328>>2]|0)+1|0,d[b+387|0]|0);g=c[e>>2]|0}if((g&16|0)!=0){Je(b+348|0,(c[b+328>>2]|0)+1|0);g=c[e>>2]|0}if((g&8|0)!=0){ke(b+348|0,(c[b+328>>2]|0)+1|0,b+477|0);g=c[e>>2]|0}if((g&131072|0)!=0){le(b+348|0,(c[b+328>>2]|0)+1|0);g=c[e>>2]|0}do{if((g&524288|0)!=0){f=b+348|0;g=(c[b+328>>2]|0)+1|0;h=a[b+356|0]|0;if((h<<24>>24|0)==4){f=c[f>>2]|0;h=(f|0)==0;if((a[b+357|0]|0)==8){if(h){break}else{h=0}while(1){i=g+1|0;a[i]=~a[i];h=h+1|0;if(h>>>0<f>>>0){g=g+2|0}else{break}}}else{if(h){break}else{h=0}while(1){j=g+2|0;i=g+3|0;a[j]=~a[j];a[i]=~a[i];h=h+1|0;if(h>>>0<f>>>0){g=g+4|0}else{break}}}}else if((h<<24>>24|0)==6){f=c[f>>2]|0;h=(f|0)==0;if((a[b+357|0]|0)==8){if(h){break}else{h=0}while(1){j=g+3|0;a[j]=~a[j];h=h+1|0;if(h>>>0<f>>>0){g=g+4|0}else{break}}}else{if(h){break}else{h=0}while(1){i=g+6|0;j=g+7|0;a[i]=~a[i];a[j]=~a[j];h=h+1|0;if(h>>>0<f>>>0){g=g+8|0}else{break}}}}else{break}}}while(0);f=c[e>>2]|0;if((f&1|0)!=0){Me(b+348|0,(c[b+328>>2]|0)+1|0);f=c[e>>2]|0}if((f&32|0)==0){return}Ie(b+348|0,(c[b+328>>2]|0)+1|0);return}function je(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b+9|0;if((a[h]|0)!=8){return}g=b+10|0;if((a[g]|0)!=1){return}do{if((f|0)==1){k=b|0;i=c[k>>2]|0;if((i|0)==0){break}else{j=0;n=0;m=128;l=e}while(1){n=((a[e]|0)==0?0:m)|n;if((m|0)>1){m=m>>1}else{a[l]=n;l=l+1|0;m=128;n=0}j=j+1|0;if(j>>>0<i>>>0){e=e+1|0}else{break}}if((m|0)==128){break}a[l]=n}else if((f|0)==2){k=b|0;j=c[k>>2]|0;if((j|0)==0){break}else{i=e;l=e;m=6;n=0;e=0}while(1){n=(a[i]&3)<<m|n;if((m|0)==0){a[l]=n;n=0;m=6;l=l+1|0}else{m=m-2|0}e=e+1|0;if(e>>>0<j>>>0){i=i+1|0}else{break}}if((m|0)==6){break}a[l]=n}else if((f|0)==4){k=b|0;j=c[k>>2]|0;if((j|0)==0){break}else{i=e;n=4;m=0;l=0}while(1){m=(a[i]&15)<<n|m;if((n|0)==0){a[e]=m;m=0;n=4;e=e+1|0}else{n=n-4|0}l=l+1|0;if(l>>>0<j>>>0){i=i+1|0}else{break}}if((n|0)==4){break}a[e]=m}else{k=b|0}}while(0);a[h]=f;f=ha(d[g]|0,f)|0;a[b+11|0]=f;f=f&255;g=c[k>>2]|0;if(f>>>0>7>>>0){f=ha(f>>>3,g)|0}else{f=((ha(f,g)|0)+7|0)>>>3}c[b+4>>2]=f;return}function ke(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+32|0;j=g|0;h=g+16|0;m=a[b+8|0]|0;if(m<<24>>24==3){i=g;return}l=a[b+9|0]|0;n=l&255;if((m&2)==0){k=d[f+3|0]|0;c[j>>2]=n-k;c[h>>2]=k;k=1}else{k=d[f|0]|0;c[j>>2]=n-k;c[h>>2]=k;k=d[f+1|0]|0;c[j+4>>2]=n-k;c[h+4>>2]=k;k=d[f+2|0]|0;c[j+8>>2]=n-k;c[h+8>>2]=k;k=3}if((m&4)!=0){q=d[f+4|0]|0;c[j+(k<<2)>>2]=n-q;c[h+(k<<2)>>2]=q;k=k+1|0}if((l&255)>>>0<8>>>0){k=c[b+4>>2]|0;f=a[f+3|0]|0;if(f<<24>>24==1&l<<24>>24==2){f=85}else{f=l<<24>>24==4&f<<24>>24==3?17:255}if((k|0)==0){i=g;return}j=j|0;h=h|0;l=0;while(1){b=a[e]|0;a[e]=0;n=c[j>>2]|0;if((n|0)>(-(c[h>>2]|0)|0)){b=b&255;m=0;do{if((n|0)>0){m=(m&255|b<<n)&255}else{m=(m&255|b>>>((-n|0)>>>0)&f)&255}a[e]=m;q=c[h>>2]|0;n=n-q|0;}while((n|0)>(-q|0))}l=l+1|0;if(l>>>0<k>>>0){e=e+1|0}else{break}}i=g;return}f=ha(c[b>>2]|0,k)|0;b=(f|0)==0;if(l<<24>>24==8){if(b){i=g;return}else{l=0}while(1){b=(l>>>0)%(k>>>0)|0;m=a[e]|0;a[e]=0;n=c[j+(b<<2)>>2]|0;b=h+(b<<2)|0;if((n|0)>(-(c[b>>2]|0)|0)){m=m&255;o=0;do{if((n|0)>0){o=(o&255|m<<n)&255}else{o=(o&255|m>>>((-n|0)>>>0))&255}a[e]=o;q=c[b>>2]|0;n=n-q|0;}while((n|0)>(-q|0))}l=l+1|0;if(l>>>0<f>>>0){e=e+1|0}else{break}}i=g;return}if(b){i=g;return}else{b=0}while(1){o=(b>>>0)%(k>>>0)|0;l=e+1|0;q=c[j+(o<<2)>>2]|0;o=c[h+(o<<2)>>2]|0;m=-o|0;if((q|0)>(m|0)){n=((d[e]|0)<<8|(d[l]|0))&65535;p=0;do{if((q|0)>0){p=(n<<q|p&65535)&65535}else{p=(n>>>((-q|0)>>>0)|p&65535)&65535}q=q-o|0;}while((q|0)>(m|0));m=(p&65535)>>>8&255;n=p&255}else{m=0;n=0}a[e]=m;a[l]=n;b=b+1|0;if(b>>>0<f>>>0){e=e+2|0}else{break}}i=g;return}function le(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=a[b+8|0]|0;if((e<<24>>24|0)==4){e=c[b>>2]|0;f=(e|0)==0;if((a[b+9|0]|0)==8){if(f){return}else{b=0}while(1){f=d+1|0;g=a[d]|0;a[d]=a[f]|0;a[f]=g;b=b+1|0;if(b>>>0<e>>>0){d=d+2|0}else{break}}return}else{if(f){return}else{b=0}while(1){j=d+1|0;i=a[d]|0;h=d+2|0;f=a[j]|0;g=d+3|0;a[d]=a[h]|0;a[j]=a[g]|0;a[h]=i;a[g]=f;b=b+1|0;if(b>>>0<e>>>0){d=d+4|0}else{break}}return}}else if((e<<24>>24|0)==6){e=c[b>>2]|0;f=(e|0)==0;if((a[b+9|0]|0)==8){if(f){return}else{b=0}while(1){g=d+1|0;i=a[d]|0;h=d+2|0;a[d]=a[g]|0;j=d+3|0;a[g]=a[h]|0;a[h]=a[j]|0;a[j]=i;b=b+1|0;if(b>>>0<e>>>0){d=d+4|0}else{break}}return}else{if(f){return}else{b=0}while(1){f=d+1|0;g=a[d]|0;h=d+2|0;i=a[f]|0;j=d+3|0;a[d]=a[h]|0;k=d+4|0;a[f]=a[j]|0;f=d+5|0;a[h]=a[k]|0;h=d+6|0;a[j]=a[f]|0;j=d+7|0;a[k]=a[h]|0;a[f]=a[j]|0;a[h]=g;a[j]=i;b=b+1|0;if(b>>>0<e>>>0){d=d+8|0}else{break}}return}}else{return}}function me(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;g=a[b+8|0]|0;if((g&2)==0){return}f=c[b>>2]|0;b=a[b+9|0]|0;if((b<<24>>24|0)==16){if((g<<24>>24|0)==2){g=6}else if((g<<24>>24|0)==6){g=8}else{return}if((f|0)==0){return}else{b=0}while(1){k=e+1|0;i=(d[e+2|0]|0)<<8|(d[e+3|0]|0);j=e+4|0;h=e+5|0;l=((d[e]|0)<<8|(d[k]|0))-i|0;i=((d[j]|0)<<8|(d[h]|0))-i|0;a[e]=l>>>8;a[k]=l;a[j]=i>>>8;a[h]=i;b=b+1|0;if(b>>>0<f>>>0){e=e+g|0}else{break}}return}else if((b<<24>>24|0)==8){if((g<<24>>24|0)==6){g=4}else if((g<<24>>24|0)==2){g=3}else{return}if((f|0)==0){return}else{b=0}while(1){k=a[e+1|0]|0;a[e]=(a[e]|0)-k;l=e+2|0;a[l]=(a[l]|0)-k;b=b+1|0;if(b>>>0<f>>>0){e=e+g|0}else{break}}return}else{return}}function ne(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+744|0;g=e|0;if((a|0)==2){a=288;f=3}else if((a|0)==1){a=744;f=3}else{a=0}do{if((f|0)==3){if((b|0)==0){f=qp(a)|0;if((f|0)==0){a=0;break}Pp(f|0,0,a|0)|0;a=f;break}else{c[g+672>>2]=d;f=Mc[b&63](g,a)|0;if((f|0)==0){a=0;break}Pp(f|0,0,a|0)|0;a=f;break}}}while(0);i=e;return a|0}function oe(a){a=a|0;if((a|0)==0){return}rp(a);return}function pe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+744|0;f=e|0;if((a|0)==0){i=e;return}if((b|0)==0){rp(a);i=e;return}else{c[f+672>>2]=d;zc[b&127](f,a);i=e;return}}function qe(a,b){a=a|0;b=b|0;var d=0;if((a|0)==0|(b|0)==0){d=0;return d|0}d=c[a+676>>2]|0;if((d|0)==0){b=qp(b)|0}else{b=Mc[d&63](a,b)|0}if((b|0)!=0){d=b;return d|0}if((c[a+200>>2]&1048576|0)!=0){d=0;return d|0}ve(a,16168);d=0;return d|0}function re(a,b){a=a|0;b=b|0;var d=0;if((a|0)==0|(b|0)==0){return}d=c[a+680>>2]|0;if((d|0)==0){rp(b);return}else{zc[d&127](a,b);return}}function se(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((a|0)==0){f=0;return f|0}e=a+200|0;d=c[e>>2]|0;c[e>>2]=d|1048576;do{if((b|0)==0){b=0}else{f=c[a+676>>2]|0;if((f|0)==0){b=qp(b)|0}else{b=Mc[f&63](a,b)|0}if((b|0)!=0){break}if((c[e>>2]&1048576|0)!=0){b=0;break}ve(a,16168);b=0}}while(0);c[e>>2]=d;f=b;return f|0}function te(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Np(b|0,c|0,d)|0;return b|0}function ue(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if((a|0)==0){return}c[a+672>>2]=b;c[a+676>>2]=d;c[a+680>>2]=e;return}function ve(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;e=i;i=i+32|0;f=e|0;g=e+16|0;h=g|0;do{if((b|0)!=0){j=c[b+200>>2]|0;do{if((j&786432|0)!=0){if((a[d]|0)==35){k=1}else{if((j&524288|0)==0){break}d=g|0;a[d]=48;a[g+1|0]=0;break}while(1){l=k+1|0;if((a[d+k|0]|0)==32){break}if((l|0)<15){k=l}else{k=l;break}}if((j&524288|0)==0){d=d+k|0;break}j=k-1|0;if((j|0)>0){Np(h|0,d+1|0,j)|0;h=k-2|0}else{h=-1}a[g+h|0]=0;d=g|0}}while(0);g=c[b+156>>2]|0;if((g|0)==0){break}zc[g&127](b,d)}}while(0);j=f|0;do{if((a[d]|0)==35){l=0;k=35;while(1){if((l|0)>=15){break}g=l+1|0;h=a[d+g|0]|0;a[f+l|0]=h;if(k<<24>>24==32){break}else{l=g;k=h}}if((l-2|0)>>>0<13>>>0){a[f+(l-1)|0]=0;k=c[q>>2]|0;ec(k|0,14784,(h=i,i=i+16|0,c[h>>2]=j,c[h+8>>2]=d+(l+1),h)|0)|0;i=h;Ta(10,k|0)|0;break}else{k=c[q>>2]|0;ec(k|0,13824,(j=i,i=i+16|0,c[j>>2]=d,c[j+8>>2]=l,j)|0)|0;i=j;Ta(10,k|0)|0;break}}else{l=c[q>>2]|0;ec(l|0,13256,(k=i,i=i+8|0,c[k>>2]=d,k)|0)|0;i=k;Ta(10,l|0)|0}}while(0);if((b|0)==0){i=e;return}else{mc(b|0,1)}}function we(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+16|0;e=f|0;do{if((b|0)==0){j=0}else{a:do{if((c[b+200>>2]&786432|0)==0){j=0}else{if((a[d]|0)==35){j=1}else{j=0;break}while(1){g=j+1|0;if((a[d+j|0]|0)==32){break a}if((g|0)<15){j=g}else{j=g;break}}}}while(0);g=c[b+160>>2]|0;if((g|0)==0){break}zc[g&127](b,d+j|0);i=f;return}}while(0);h=d+j|0;g=e|0;if((a[h]|0)==35){m=0;l=35}else{m=c[q>>2]|0;ec(m|0,15896,(l=i,i=i+8|0,c[l>>2]=h,l)|0)|0;i=l;Ta(10,m|0)|0;i=f;return}while(1){if((m|0)>=15){break}k=m+1|0;b=a[d+(k+j)|0]|0;a[e+m|0]=b;if(l<<24>>24==32){break}else{m=k;l=b}}if((m-2|0)>>>0<13>>>0){a[e+(m+1)|0]=0;l=c[q>>2]|0;ec(l|0,15920,(k=i,i=i+16|0,c[k>>2]=g,c[k+8>>2]=d+(m+j),k)|0)|0;i=k;Ta(10,l|0)|0;i=f;return}else{m=c[q>>2]|0;ec(m|0,15896,(l=i,i=i+8|0,c[l>>2]=h,l)|0)|0;i=l;Ta(10,m|0)|0;i=f;return}}function xe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if((a|0)==0){return}c[a+164>>2]=b;c[a+156>>2]=d;c[a+160>>2]=e;return}function ye(a){a=a|0;if((a|0)==0){return}a=a+204|0;c[a>>2]=c[a>>2]|1;return}function ze(b){b=b|0;if((b|0)==0){return}if((a[b+387|0]|0)!=16){return}b=b+204|0;c[b>>2]=c[b>>2]|16;return}function Ae(b){b=b|0;var e=0;if((b|0)==0){return}if((d[b+387|0]|0)>>>0>=8>>>0){return}e=b+204|0;c[e>>2]=c[e>>2]|4;a[b+388|0]=8;return}function Be(a){a=a|0;if((a|0)==0){return}if((d[a+387|0]|0)>>>0>=8>>>0){return}a=a+204|0;c[a>>2]=c[a>>2]|65536;return}function Ce(b,d){b=b|0;d=d|0;var e=0;if((b|0)==0){return}e=b+204|0;c[e>>2]=c[e>>2]|8;b=b+477|0;d=d|0;a[b]=a[d]|0;a[b+1|0]=a[d+1|0]|0;a[b+2|0]=a[d+2|0]|0;a[b+3|0]=a[d+3|0]|0;a[b+4|0]=a[d+4|0]|0;return}function De(b){b=b|0;do{if((b|0)==0){b=1}else{if((a[b+383|0]|0)==0){b=1;break}b=b+204|0;c[b>>2]=c[b>>2]|2;b=7}}while(0);return b|0}function Ee(e,f,g){e=e|0;f=f|0;g=g|0;var h=0;if((e|0)==0){return}h=e+204|0;c[h>>2]=c[h>>2]|32768;b[e+394>>1]=f&255;f=e+200|0;h=c[f>>2]|0;c[f>>2]=(g|0)==1?h|128:h&-129;g=a[e+386|0]|0;if((g<<24>>24|0)==0){if((d[e+387|0]|0)>>>0<=7>>>0){return}a[e+391|0]=2;return}else if((g<<24>>24|0)==2){a[e+391|0]=4;return}else{return}}function Fe(a){a=a|0;if((a|0)==0){return}a=a+204|0;c[a>>2]=c[a>>2]|131072;return}function Ge(a){a=a|0;if((a|0)==0){return}a=a+204|0;c[a>>2]=c[a>>2]|524288;return}function He(a){a=a|0;if((a|0)==0){return}a=a+204|0;c[a>>2]=c[a>>2]|32;return}function Ie(b,d){b=b|0;d=d|0;var e=0,f=0;e=a[b+8|0]|0;if((e<<24>>24|0)==0){b=c[b+4>>2]|0;if((b|0)==0){return}else{e=0}while(1){a[d]=~a[d];e=e+1|0;if(e>>>0<b>>>0){d=d+1|0}else{break}}return}else if((e<<24>>24|0)==4){e=a[b+9|0]|0;if((e<<24>>24|0)==16){b=c[b+4>>2]|0;if((b|0)==0){return}else{e=0}while(1){a[d]=~a[d];f=d+1|0;a[f]=~a[f];e=e+4|0;if(e>>>0<b>>>0){d=d+4|0}else{break}}return}else if((e<<24>>24|0)==8){b=c[b+4>>2]|0;if((b|0)==0){return}else{e=0}while(1){a[d]=~a[d];e=e+2|0;if(e>>>0<b>>>0){d=d+2|0}else{break}}return}else{return}}else{return}}function Je(b,e){b=b|0;e=e|0;var f=0,g=0,h=0;if((a[b+9|0]|0)!=16){return}b=ha(d[b+10|0]|0,c[b>>2]|0)|0;if((b|0)==0){return}else{f=0}while(1){h=a[e]|0;g=e+1|0;a[e]=a[g]|0;a[g]=h;f=f+1|0;if(f>>>0<b>>>0){e=e+2|0}else{break}}return}function Ke(b,e){b=b|0;e=e|0;var f=0,g=0;f=a[b+9|0]|0;if((f&255)>>>0>=8>>>0){return}g=c[b+4>>2]|0;b=e+g|0;if((f<<24>>24|0)==2){f=48}else if((f<<24>>24|0)==1){f=1960}else if((f<<24>>24|0)==4){f=2216}else{return}if((g|0)<=0){return}do{a[e]=a[f+(d[e]|0)|0]|0;e=e+1|0;}while(e>>>0<b>>>0);return}function Le(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=c[b>>2]|0;g=b+8|0;j=a[g]|0;if((j<<24>>24|0)==2){h=3}else if((j<<24>>24|0)==4){h=19}else if((j<<24>>24|0)==0){h=20}else if((j<<24>>24|0)==6){if((e&4194304|0)!=0){h=3}}do{if((h|0)==3){i=b+10|0;if((a[i]|0)!=4){if((j<<24>>24|0)==4){h=19;break}else if((j<<24>>24|0)==0){h=20;break}else{break}}j=(e&128|0)!=0;if((a[b+9|0]|0)==8){do{if(j){if(f>>>0>1>>>0){k=1;j=d;m=d}else{break}while(1){d=j+4|0;l=m+3|0;a[l]=a[d]|0;a[m+4|0]=a[j+5|0]|0;a[m+5|0]=a[j+6|0]|0;k=k+1|0;if(k>>>0<f>>>0){j=d;m=l}else{break}}}else{if((f|0)==0){break}else{j=d;k=0}while(1){a[j]=a[d+1|0]|0;a[j+1|0]=a[d+2|0]|0;a[j+2|0]=a[d+3|0]|0;k=k+1|0;if(k>>>0<f>>>0){j=j+3|0;d=d+4|0}else{break}}}}while(0);a[b+11|0]=24;c[b+4>>2]=f*3|0}else{do{if(j){if(f>>>0>1>>>0){k=1;j=d;m=d}else{break}while(1){d=j+8|0;l=m+6|0;a[l]=a[d]|0;a[m+7|0]=a[j+9|0]|0;a[m+8|0]=a[j+10|0]|0;a[m+9|0]=a[j+11|0]|0;a[m+10|0]=a[j+12|0]|0;a[m+11|0]=a[j+13|0]|0;k=k+1|0;if(k>>>0<f>>>0){j=d;m=l}else{break}}}else{if((f|0)==0){break}else{j=d;k=0}while(1){a[j]=a[d+2|0]|0;a[j+1|0]=a[d+3|0]|0;a[j+2|0]=a[d+4|0]|0;a[j+3|0]=a[d+5|0]|0;a[j+4|0]=a[d+6|0]|0;a[j+5|0]=a[d+7|0]|0;k=k+1|0;if(k>>>0<f>>>0){j=j+6|0;d=d+8|0}else{break}}}}while(0);a[b+11|0]=48;c[b+4>>2]=f*6|0}a[i]=3}}while(0);if((h|0)==19){if((e&4194304|0)!=0){h=20}}do{if((h|0)==20){h=b+10|0;if((a[h]|0)!=2){break}j=(e&128|0)!=0;if((a[b+9|0]|0)==8){i=(f|0)==0;do{if(j){if(i){break}else{i=d;j=0}while(1){a[i]=a[d]|0;j=j+1|0;if(j>>>0<f>>>0){i=i+1|0;d=d+2|0}else{break}}}else{if(i){break}else{i=d;j=0}while(1){a[i]=a[d+1|0]|0;j=j+1|0;if(j>>>0<f>>>0){i=i+1|0;d=d+2|0}else{break}}}}while(0);a[b+11|0]=8;c[b+4>>2]=f}else{do{if(j){if(f>>>0>1>>>0){k=1;i=d;l=d}else{break}while(1){j=i+4|0;d=l+2|0;a[d]=a[j]|0;a[l+3|0]=a[i+5|0]|0;k=k+1|0;if(k>>>0<f>>>0){i=j;l=d}else{break}}}else{if((f|0)==0){break}else{i=d;j=0}while(1){a[i]=a[d+2|0]|0;a[i+1|0]=a[d+3|0]|0;j=j+1|0;if(j>>>0<f>>>0){i=i+2|0;d=d+4|0}else{break}}}}while(0);a[b+11|0]=16;c[b+4>>2]=f<<1}a[h]=1}}while(0);if((e&4194304|0)==0){return}a[g]=a[g]&-5;return}function Me(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;f=a[b+8|0]|0;if((f&2)==0){return}e=c[b>>2]|0;b=a[b+9|0]|0;if((b<<24>>24|0)==8){if((f<<24>>24|0)==2){if((e|0)==0){return}else{f=0}while(1){g=a[d]|0;b=d+2|0;a[d]=a[b]|0;a[b]=g;f=f+1|0;if(f>>>0<e>>>0){d=d+3|0}else{break}}return}else if((f<<24>>24|0)==6){if((e|0)==0){return}else{f=0}while(1){b=a[d]|0;g=d+2|0;a[d]=a[g]|0;a[g]=b;f=f+1|0;if(f>>>0<e>>>0){d=d+4|0}else{break}}return}else{return}}else if((b<<24>>24|0)==16){if((f<<24>>24|0)==6){if((e|0)==0){return}else{f=0}while(1){b=a[d]|0;h=d+4|0;a[d]=a[h]|0;a[h]=b;h=d+1|0;b=a[h]|0;g=d+5|0;a[h]=a[g]|0;a[g]=b;f=f+1|0;if(f>>>0<e>>>0){d=d+8|0}else{break}}return}else if((f<<24>>24|0)==2){if((e|0)==0){return}else{f=0}while(1){g=a[d]|0;b=d+4|0;a[d]=a[b]|0;a[b]=g;b=d+1|0;g=a[b]|0;h=d+5|0;a[b]=a[h]|0;a[h]=g;f=f+1|0;if(f>>>0<e>>>0){d=d+6|0}else{break}}return}else{return}}else{return}}function Ne(a){a=a|0;var b=0,e=0,f=0,g=0;b=i;i=i+8|0;g=b|0;c[g>>2]=1196314761;c[g+4>>2]=169478669;e=a+392|0;f=d[e]|0;qf(a,g+f|0,8-f|0);if((d[e]|0)>>>0>=3>>>0){i=b;return}g=a+196|0;c[g>>2]=c[g>>2]|4096;i=b;return}function Oe(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+16|0;j=h|0;k=h+8|0;if((b|0)==0){i=h;return}m=k|0;a[m]=g>>>24;a[k+1|0]=g>>>16;a[k+2|0]=g>>>8;a[k+3|0]=g;l=e;k=k+4|0;D=d[l]|d[l+1|0]<<8|d[l+2|0]<<16|d[l+3|0]<<24|0;a[k]=D;D=D>>8;a[k+1|0]=D;D=D>>8;a[k+2|0]=D;D=D>>8;a[k+3|0]=D;qf(b,m,8);k=b+376|0;D=d[l]|d[l+1|0]<<8|d[l+2|0]<<16|d[l+3|0]<<24|0;a[k]=D;D=D>>8;a[k+1|0]=D;D=D>>8;a[k+2|0]=D;D=D>>8;a[k+3|0]=D;Qd(b);Rd(b,e,4);if(!((f|0)==0|(g|0)==0)){qf(b,f,g);Rd(b,f,g)}m=j|0;l=c[b+364>>2]|0;a[m]=l>>>24;a[j+1|0]=l>>>16;a[j+2|0]=l>>>8;a[j+3|0]=l;qf(b,m,4);i=h;return}function Pe(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0;m=i;i=i+16|0;n=m|0;a:do{switch(h|0){case 0:{switch(g|0){case 1:case 2:case 4:case 8:case 16:{a[b+390|0]=1;break a};default:{ve(b,14048);break a}}break};case 6:{if(!((g|0)==16|(g|0)==8)){ve(b,13696)}a[b+390|0]=4;break};case 2:{if(!((g|0)==16|(g|0)==8)){ve(b,16992)}a[b+390|0]=3;break};case 4:{if(!((g|0)==16|(g|0)==8)){ve(b,14592)}a[b+390|0]=2;break};case 3:{if((g|0)==1|(g|0)==2|(g|0)==4|(g|0)==8){a[b+390|0]=1;break a}else{ve(b,15696);break a}break};default:{ve(b,13192)}}}while(0);if((j|0)==0){j=j&255}else{we(b,12688);j=0}do{if((c[b+652>>2]&4|0)==0){o=24}else{if((c[b+196>>2]&4096|0)!=0){o=24;break}if((h&-5|0)!=2){o=24;break}if((k|0)==64|(k|0)==0){k=k&255}else{o=25}}}while(0);if((o|0)==24){if((k|0)==0){k=k&255}else{o=25}}if((o|0)==25){we(b,12136);k=0}if(l>>>0>1>>>0){we(b,11792);p=1}else{p=l&255}l=g&255;o=b+387|0;a[o]=l;q=h&255;h=b+386|0;a[h]=q;a[b+383|0]=p;a[b+660|0]=k;a[b+700|0]=j;c[b+292>>2]=e;c[b+296>>2]=f;r=a[b+390|0]|0;g=ha(r&255,g)|0;a[b+389|0]=g;g=g&255;if(g>>>0>7>>>0){g=ha(g>>>3,e)|0}else{g=((ha(g,e)|0)+7|0)>>>3}c[b+308>>2]=g;c[b+304>>2]=e;a[b+388|0]=l;a[b+391|0]=r;r=n|0;a[r]=e>>>24;a[n+1|0]=e>>>16;a[n+2|0]=e>>>8;a[n+3|0]=e;a[n+4|0]=f>>>24;a[n+5|0]=f>>>16;a[n+6|0]=f>>>8;a[n+7|0]=f;a[n+8|0]=l;a[n+9|0]=q;a[n+10|0]=j;a[n+11|0]=k;a[n+12|0]=p;Oe(b,1936,r,13);n=b+208|0;c[b+240>>2]=18;c[b+244>>2]=96;c[b+248>>2]=b;e=b+385|0;f=a[e]|0;b:do{if(f<<24>>24==0){do{if((a[h]|0)!=3){if((d[o]|0)>>>0<8>>>0){break}a[e]=-8;f=-8;break b}}while(0);a[e]=8;f=8}}while(0);e=c[b+200>>2]|0;do{if((e&1|0)==0){o=b+288|0;if(f<<24>>24==8){c[o>>2]=0;break}else{c[o>>2]=1;break}}}while(0);if((e&2|0)==0){c[b+272>>2]=-1}if((e&4|0)==0){c[b+284>>2]=8}if((e&8|0)==0){c[b+280>>2]=15}f=b+276|0;if((e&16|0)==0){c[f>>2]=8;e=8}else{e=c[f>>2]|0}n=wf(n,c[b+272>>2]|0,e,c[b+280>>2]|0,c[b+284>>2]|0,c[b+288>>2]|0,11560,56)|0;if((n|0)==(-6|0)){ve(b,18264)}else if((n|0)==0){r=b+264|0;r=c[r>>2]|0;q=b+220|0;c[q>>2]=r;q=b+268|0;q=c[q>>2]|0;r=b+224|0;c[r>>2]=q;r=b+252|0;c[r>>2]=0;r=b+196|0;c[r>>2]=1;i=m;return}else if((n|0)==(-2|0)){ve(b,17832)}else if((n|0)==(-4|0)){ve(b,17464)}ve(b,17168);r=b+264|0;r=c[r>>2]|0;q=b+220|0;c[q>>2]=r;q=b+268|0;q=c[q>>2]|0;r=b+224|0;c[r>>2]=q;r=b+252|0;c[r>>2]=0;r=b+196|0;c[r>>2]=1;i=m;return}function Qe(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0;h=i;i=i+24|0;j=h|0;l=h+8|0;n=h+16|0;if((c[e+652>>2]&1|0)==0){if((g|0)==0|g>>>0>256>>>0){k=4}}else{if(g>>>0>256>>>0){k=4}}do{if((k|0)==4){if((a[e+386|0]|0)==3){ve(e,16920);break}we(e,16920);i=h;return}}while(0);if((a[e+386|0]&2)==0){we(e,16704);i=h;return}b[e+372>>1]=g;o=g*3|0;m=l|0;k=(e|0)==0;if(!k){a[m]=o>>>24;a[l+1|0]=o>>>16;a[l+2|0]=o>>>8;a[l+3|0]=o;o=l+4|0;D=d[1928]|d[1929]<<8|d[1930]<<16|d[1931]<<24|0;a[o]=D;D=D>>8;a[o+1|0]=D;D=D>>8;a[o+2|0]=D;D=D>>8;a[o+3|0]=D;qf(e,m,8);o=e+376|0;D=d[1928]|d[1929]<<8|d[1930]<<16|d[1931]<<24|0;a[o]=D;D=D>>8;a[o+1|0]=D;D=D>>8;a[o+2|0]=D;D=D>>8;a[o+3|0]=D;Qd(e);Rd(e,1928,4)}if((g|0)!=0){m=n|0;l=n+1|0;n=n+2|0;if(k){o=0;while(1){a[m]=a[f|0]|0;a[l]=a[f+1|0]|0;a[n]=a[f+2|0]|0;o=o+1|0;if(o>>>0<g>>>0){f=f+3|0}else{break}}}else{o=0;while(1){a[m]=a[f|0]|0;a[l]=a[f+1|0]|0;a[n]=a[f+2|0]|0;qf(e,m,3);Rd(e,m,3);o=o+1|0;if(o>>>0<g>>>0){f=f+3|0}else{break}}}}g=j|0;if(!k){o=c[e+364>>2]|0;a[g]=o>>>24;a[j+1|0]=o>>>16;a[j+2|0]=o>>>8;a[j+3|0]=o;qf(e,g,4)}o=e+196|0;c[o>>2]=c[o>>2]|2;i=h;return}function Re(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;h=b+196|0;do{if((c[h>>2]&4|0)==0){if((a[b+700|0]|0)!=0){break}g=a[e]|0;j=g&255;if(!((j&15|0)==8&(j&240)>>>0<113>>>0)){ve(b,16520);break}if(f>>>0<=1>>>0){break}k=c[b+296>>2]|0;if(k>>>0>=16384>>>0){break}i=c[b+292>>2]|0;if(i>>>0>=16384>>>0){break}i=ha(d[b+390|0]|0,i)|0;i=ha(((ha(i,d[b+387|0]|0)|0)+15|0)>>>3,k)|0;k=j>>>4;l=1<<k+7;if(i>>>0<=l>>>0&l>>>0>255>>>0){while(1){k=k-1|0;j=l>>>1;if(i>>>0<=j>>>0&l>>>0>511>>>0){l=j}else{break}}}j=k<<4|8;i=j&255;if(g<<24>>24==i<<24>>24){break}a[e]=i;l=e+1|0;k=a[l]&-32&255;a[l]=(k|(((k|j<<8)>>>0)%31|0))^31}}while(0);Oe(b,1952,e,f);c[h>>2]=c[h>>2]|4;return}function Se(a){a=a|0;Oe(a,1944,0,0);a=a+196|0;c[a>>2]=c[a>>2]|16;return}function Te(b,c){b=b|0;c=+c;var d=0,e=0,f=0,g=0;d=i;i=i+8|0;f=d|0;g=~~(c*1.0e5+.5);e=f|0;a[e]=g>>>24;a[f+1|0]=g>>>16;a[f+2|0]=g>>>8;a[f+3|0]=g;Oe(b,1904,e,4);i=d;return}function Ue(b,c){b=b|0;c=c|0;var d=0,e=0;d=i;i=i+8|0;if((c|0)>3){we(b,16408)}e=d|0;a[e]=c;Oe(b,1680,e,1);i=d;return}function Ve(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;k=i;i=i+48|0;j=k|0;m=k+8|0;n=k+16|0;l=k+24|0;Pp(l|0,0,20)|0;e=We(b,e,n)|0;if((e|0)==0){i=k;return}if((f|0)!=0){we(b,16336)}h=(g|0)==0?0:h;do{if((h|0)>3){f=(d[g+1|0]|0)<<16|(d[g]|0)<<24|(d[g+2|0]|0)<<8|(d[g+3|0]|0);if((f|0)>=0){break}we(b,16224);re(b,c[n>>2]|0);i=k;return}else{f=0}}while(0);if((h|0)<(f|0)){we(b,16120);re(b,c[n>>2]|0);i=k;return}if((h|0)>(f|0)){we(b,16032);h=f}if((h|0)==0){f=0}else{f=Xe(b,g,h,0,l)|0}h=e+2|0;o=h+f|0;p=m|0;g=(b|0)==0;if(!g){a[p]=o>>>24;a[m+1|0]=o>>>16;a[m+2|0]=o>>>8;a[m+3|0]=o;o=m+4|0;D=d[1888]|d[1889]<<8|d[1890]<<16|d[1891]<<24|0;a[o]=D;D=D>>8;a[o+1|0]=D;D=D>>8;a[o+2|0]=D;D=D>>8;a[o+3|0]=D;qf(b,p,8);p=b+376|0;D=d[1888]|d[1889]<<8|d[1890]<<16|d[1891]<<24|0;a[p]=D;D=D>>8;a[p+1|0]=D;D=D>>8;a[p+2|0]=D;D=D>>8;a[p+3|0]=D;Qd(b);Rd(b,1888,4)}m=c[n>>2]|0;a[m+(e+1)|0]=0;if(!(g|(m|0)==0|(h|0)==0)){qf(b,m,h);Rd(b,m,h)}if((f|0)!=0){Ye(b,l)}l=j|0;if(!g){p=c[b+364>>2]|0;a[l]=p>>>24;a[j+1|0]=p>>>16;a[j+2|0]=p>>>8;a[j+3|0]=p;qf(b,l,4)}re(b,m);i=k;return}function We(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+40|0;h=f|0;c[e>>2]=0;do{if((d|0)!=0){g=Mp(d|0)|0;if((g|0)==0){break}j=se(b,g+2|0)|0;c[e>>2]=j;if((j|0)==0){we(b,14744);l=0;i=f;return l|0}k=a[d]|0;if(k<<24>>24!=0){h=h|0;do{if((k&255)>>>0<32>>>0|(k-127&255)>>>0<34>>>0){gb(h|0,40,14680,(l=i,i=i+8|0,c[l>>2]=k&255,l)|0)|0;i=l;we(b,h);k=32}a[j]=k;d=d+1|0;j=j+1|0;k=a[d]|0;}while(k<<24>>24!=0)}a[j]=0;k=c[e>>2]|0;h=k+(g-1)|0;if((a[h]|0)==32){we(b,14520);if((a[h]|0)==32){while(1){d=h-1|0;a[h]=0;g=g-1|0;if((a[d]|0)==32){h=d}else{break}}}k=c[e>>2]|0}l=a[k]|0;if(l<<24>>24==32){we(b,14400);l=a[k]|0;if(l<<24>>24==32){do{k=k+1|0;g=g-1|0;l=a[k]|0;}while(l<<24>>24==32)}h=0;j=0;d=c[e>>2]|0}else{h=0;j=0;d=k}a:while(1){do{if((l<<24>>24|0)==32){if((j|0)==0){a[d]=32;j=1;d=d+1|0;break}else{h=1;g=g-1|0;break}}else if((l<<24>>24|0)==0){break a}else{a[d]=l;j=0;d=d+1|0}}while(0);l=k+1|0;k=l;l=a[l]|0}a[d]=0;if((h|0)!=0){we(b,14240)}if((g|0)==0){re(b,c[e>>2]|0);c[e>>2]=0;we(b,14152);l=0;i=f;return l|0}if(g>>>0<=79>>>0){l=g;i=f;return l|0}we(b,14096);a[(c[e>>2]|0)+79|0]=0;l=79;i=f;return l|0}}while(0);we(b,14912);l=0;i=f;return l|0}function Xe(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;i=i+56|0;h=f+8|0;j=f+12|0;k=f+16|0;Pp(f|0,0,20)|0;if((e|0)==-1){c[f>>2]=b;c[f+4>>2]=d;q=d;i=g;return q|0}if((e|0)>2){q=g|0;gb(q|0,50,13592,(p=i,i=i+8|0,c[p>>2]=e,p)|0)|0;i=p;we(a,q)}e=a+208|0;n=a+212|0;c[n>>2]=d;c[e>>2]=b;m=a+268|0;b=a+224|0;c[b>>2]=c[m>>2];d=a+264|0;f=a+220|0;c[f>>2]=c[d>>2];l=a+232|0;do{do{if((zf(e,0)|0)!=0){o=c[l>>2]|0;if((o|0)==0){ve(a,13664);break}else{ve(a,o);break}}}while(0);if((c[b>>2]|0)==0){p=c[h>>2]|0;o=c[j>>2]|0;do{if((p|0)>=(o|0)){q=p+4|0;c[j>>2]=q;p=c[k>>2]|0;q=qe(a,q<<2)|0;c[k>>2]=q;if((p|0)==0){break}Np(q|0,p|0,o<<2)|0;re(a,p)}}while(0);q=qe(a,c[m>>2]|0)|0;c[(c[k>>2]|0)+(c[h>>2]<<2)>>2]=q;Np(c[(c[k>>2]|0)+(c[h>>2]<<2)>>2]|0,c[d>>2]|0,c[m>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+1;c[b>>2]=c[m>>2];c[f>>2]=c[d>>2]}}while((c[n>>2]|0)!=0);a:while(1){n=zf(e,4)|0;do{if((n|0)==0){if((c[b>>2]|0)!=0){continue a}p=c[h>>2]|0;o=c[j>>2]|0;do{if((p|0)>=(o|0)){p=p+4|0;c[j>>2]=p;q=c[k>>2]|0;p=qe(a,p<<2)|0;c[k>>2]=p;if((q|0)==0){break}Np(p|0,q|0,o<<2)|0;re(a,q)}}while(0);q=qe(a,c[m>>2]|0)|0;c[(c[k>>2]|0)+(c[h>>2]<<2)>>2]=q;Np(c[(c[k>>2]|0)+(c[h>>2]<<2)>>2]|0,c[d>>2]|0,c[m>>2]|0)|0;c[h>>2]=(c[h>>2]|0)+1;c[b>>2]=c[m>>2];c[f>>2]=c[d>>2]}else if((n|0)==1){break a}else{o=c[l>>2]|0;if((o|0)==0){ve(a,13664);break}else{ve(a,o);break}}}while(0);if((n|0)==1){break}}j=c[m>>2]|0;h=ha(c[h>>2]|0,j)|0;k=c[b>>2]|0;if(k>>>0>=j>>>0){q=h;i=g;return q|0}q=j-k+h|0;i=g;return q|0}function Ye(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=c[b>>2]|0;if((d|0)!=0){b=c[b+4>>2]|0;if((a|0)==0|(b|0)==0){return}qf(a,d,b);Rd(a,d,b);return}d=b+8|0;a:do{if((c[d>>2]|0)>0){e=b+16|0;g=a+268|0;if((a|0)==0){f=0;while(1){re(0,c[(c[e>>2]|0)+(f<<2)>>2]|0);c[(c[e>>2]|0)+(f<<2)>>2]=0;f=f+1|0;if((f|0)>=(c[d>>2]|0)){break a}}}else{f=0}do{h=c[(c[e>>2]|0)+(f<<2)>>2]|0;i=c[g>>2]|0;if(!((h|0)==0|(i|0)==0)){qf(a,h,i);Rd(a,h,i);h=c[(c[e>>2]|0)+(f<<2)>>2]|0}re(a,h);c[(c[e>>2]|0)+(f<<2)>>2]=0;f=f+1|0;}while((f|0)<(c[d>>2]|0))}}while(0);d=b+16|0;if((c[b+12>>2]|0)!=0){re(a,c[d>>2]|0)}c[d>>2]=0;g=a+208|0;f=c[a+224>>2]|0;b=c[a+268>>2]|0;do{if(f>>>0<b>>>0){e=c[a+264>>2]|0;d=b-f|0;if((a|0)==0|(e|0)==0|(b|0)==(f|0)){break}qf(a,e,d);Rd(a,e,d)}}while(0);yf(g)|0;c[a+252>>2]=0;return}




// EMSCRIPTEN_END_FUNCS
var wc=[Xq,Xq,jj,Xq,Mi,Xq,Xq,Xq];var xc=[Yq,Yq,lp,Yq,mp,Yq,ce,Yq,kp,Yq,Yq,Yq,Yq,Yq,Yq,Yq];var yc=[Zq,Zq,pm,Zq,Ji,Zq,md,Zq,Ag,Zq,Zj,Zq,Hg,Zq,vh,Zq,um,Zq,Hm,Zq,ng,Zq,ag,Zq,Kj,Zq,zg,Zq,un,Zq,Fg,Zq,gj,Zq,Ig,Zq,zi,Zq,vi,Zq,Ap,Zq,xd,Zq,Ag,Zq,Fm,Zq,Vm,Zq,zk,Zq,hj,Zq,Xo,Zq,ni,Zq,lm,Zq,Gm,Zq,zd,Zq,Yh,Zq,Ki,Zq,ml,Zq,zm,Zq,Tn,Zq,ap,Zq,Sn,Zq,Nl,Zq,ti,Zq,Fg,Zq,Tg,Zq,Fi,Zq,Tk,Zq,Vn,Zq,Im,Zq,rp,Zq,cp,Zq,em,Zq,Rn,Zq,Id,Zq,bi,Zq,$f,Zq,Ei,Zq,Ok,Zq,Ag,Zq,Co,Zq,Lj,Zq,Fn,Zq,yd,Zq,nl,Zq,Xh,Zq,ii,Zq,Lk,Zq,yk,Zq,wi,Zq,bl,Zq,zp,Zq,uh,Zq,Fo,Zq,Go,Zq,oi,Zq,Jh,Zq,dn,Zq,Zo,Zq,Zh,Zq,ui,Zq,Il,Zq,Tf,Zq,xl,Zq,$h,Zq,pi,Zq,Dm,Zq,Io,Zq,bp,Zq,gg,Zq,ym,Zq,Mk,Zq,Tl,Zq,Yo,Zq,Qn,Zq,fm,Zq,Ho,Zq,Sk,Zq,Yj,Zq,Ug,Zq,yi,Zq,hg,Zq,Ai,Zq,di,Zq,Qg,Zq,mn,Zq,_l,Zq,Sl,Zq,Ll,Zq,Un,Zq,Hd,Zq,jh,Zq,tf,Zq,wd,Zq,Zo,Zq,ep,Zq,hi,Zq,Rg,Zq,Wh,Zq,od,Zq,mi,Zq,km,Zq,fq,Zq,Ad,Zq,rh,Zq,gi,Zq,og,Zq,Bm,Zq,xi,Zq,yl,Zq,kk,Zq,cl,Zq,Vf,Zq,ci,Zq,ji,Zq,Ih,Zq,fi,Zq,oe,Zq,Eo,Zq,qd,Zq,lk,Zq,dp,Zq,qm,Zq,Uf,Zq,$o,Zq,Pk,Zq,$l,Zq,Jl,Zq,Yg,Zq,Wm,Zq,Eg,Zq,ai,Zq,Jo,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq,Zq];var zc=[_q,_q,co,_q,Qf,_q,bh,_q,Dl,_q,ve,_q,fl,_q,we,_q,$n,_q,wl,_q,fe,_q,nh,_q,_n,_q,ll,_q,Wf,_q,vd,_q,om,_q,rl,_q,Zk,_q,Gl,_q,tl,_q,Yk,_q,Bl,_q,Wk,_q,El,_q,Cm,_q,ig,_q,yg,_q,Cg,_q,bg,_q,Hl,_q,bo,_q,mh,_q,gl,_q,Dg,_q,th,_q,eo,_q,vl,_q,il,_q,ao,_q,kl,_q,wm,_q,sh,_q,wh,_q,pg,_q,qh,_q,tm,_q,ql,_q,Pd,_q,al,_q,$k,_q,Xk,_q,ch,_q,Ud,_q,Kh,_q,Do,_q,sl,_q,Cl,_q,Gd,_q,re,_q,hl,_q,_q,_q,_q,_q,_q,_q];var Ac=[$q,$q,so,$q,pl,$q,Dh,$q,jn,$q,io,$q,Eh,$q,qo,$q,gq,$q,dl,$q,mk,$q,go,$q,rg,$q,Sh,$q,Rh,$q,Ln,$q,mo,$q,ei,$q,ko,$q,_o,$q,Gg,$q,Zn,$q,hq,$q,Wn,$q,lo,$q,Xn,$q,Ah,$q,hn,$q,Fl,$q,no,$q,Xf,$q,el,$q,Bn,$q,iq,$q,zl,$q,fo,$q,cg,$q,So,$q,jq,$q,Mn,$q,_h,$q,Bp,$q,ri,$q,_k,$q,dg,$q,Yn,$q,Bh,$q,Oh,$q,jg,$q,ln,$q,jl,$q,ro,$q,qg,$q,An,$q,rn,$q,Ph,$q,Uk,$q,ho,$q,Vk,$q,Bg,$q,ol,$q,tn,$q,ul,$q,jo,$q,Al,$q,vp,$q,qn,$q,Ak,$q,Dd,$q,po,$q,oo,$q,kq,$q,En,$q,wp,$q,Jd,$q,Pn,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q,$q];var Bc=[ar,ar,Ml,ar,Vl,ar,ar,ar];var Cc=[br,br,Ko,br,Di,br,Qm,br,lq,br,Xl,br,Po,br,fp,br,mm,br,Od,br,Tm,br,ah,br,Oo,br,Ii,br,Lg,br,Gh,br,Ch,br,Jm,br,Ym,br,Lh,br,rm,br,bn,br,dh,br,Om,br,Pl,br,Yf,br,ne,br,Qh,br,Mg,br,_m,br,xh,br,Pf,br,kg,br,mq,br,Uh,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br,br];var Dc=[cr,cr,im,cr,cm,cr,cr,cr];var Ec=[dr,dr,hk,dr,fk,dr,Wj,dr,Tj,dr,dr,dr,dr,dr,dr,dr];var Fc=[er,er,Qk,er,Nk,er,eh,er,Kl,er,Ul,er,Ol,er,Wl,er];var Gc=[fr,fr,np,fr,dk,fr,$j,fr,_j,fr,op,fr,ik,fr,nm,fr,Mh,fr,Xj,fr,Mj,fr,Rj,fr,Nj,fr,Bd,fr,pp,fr,yh,fr,sm,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr,fr];var Hc=[gr,gr,vo,gr];var Ic=[hr,hr,rk,hr,Bk,hr,Dk,hr,Pj,hr,jm,hr,ek,hr,ck,hr,dm,hr,nk,hr,ak,hr,Vj,hr,qk,hr,fh,hr,Ek,hr,Sj,hr,gk,hr,Cj,hr,pk,hr,bk,hr,qj,hr,Ck,hr,Qj,hr,ud,hr,uj,hr,mj,hr,oj,hr,dj,hr,sj,hr,kj,hr,ij,hr,Aj,hr,yj,hr,wj,hr,Fk,hr,Ti,hr,ok,hr,Xi,hr,Pi,hr,Ri,hr,Vi,hr,Ni,hr,bj,hr,$i,hr,Zi,hr,Li,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr,hr];var Jc=[ir,ir,gm,ir,am,ir,ir,ir];var Kc=[jr,jr,Gk,jr,Xd,jr,sk,jr];var Lc=[kr,kr,Ql,kr,Yl,kr,hm,kr,bm,kr,kr,kr,kr,kr,kr,kr];var Mc=[lr,lr,sg,lr,li,lr,Rm,lr,Th,lr,$m,lr,Xm,lr,eg,lr,lg,lr,Nm,lr,qe,lr,Fd,lr,Af,lr,nq,lr,_g,lr,td,lr,kd,lr,Zm,lr,kh,lr,Bf,lr,ki,lr,Zg,lr,Cf,lr,Hh,lr,Vh,lr,Pm,lr,Ed,lr,Em,lr,Fh,lr,Zf,lr,ld,lr,oq,lr];var Nc=[mr,mr,to,mr,uo,mr,mr,mr];var Oc=[nr,nr,pq,nr,Am,nr,qq,nr,rq,nr,nr,nr,nr,nr,nr,nr];var Pc=[or,or,Um,or,zn,or,Mo,or,Gi,or,Nn,or,Cn,or,cn,or,pn,or,Bi,or,Qo,or,gh,or,gn,or,kn,or,Kn,or,sn,or];var Qc=[pr,pr,rf,pr,Sg,pr,Yd,pr,Zl,pr,pd,pr,Og,pr,xm,pr,sq,pr,Pg,pr,hh,pr,Kg,pr,si,pr,$g,pr,Kd,pr,Wg,pr];var Rc=[qr,qr,tq,qr,Cp,qr,uq,qr,vq,qr,qr,qr,qr,qr,qr,qr];var Sc=[rr,rr,nn,rr,xn,rr,vn,rr,In,rr,on,rr,Gn,rr,en,rr,fn,rr,rr,rr,rr,rr,rr,rr,rr,rr,rr,rr,rr,rr,rr,rr];var Tc=[sr,sr,Km,sr,Uj,sr,yo,sr,wq,sr,Ao,sr,xq,sr,zo,sr,Lm,sr,Bo,sr,an,sr,xo,sr,No,sr,Sm,sr,Lo,sr,wo,sr,fj,sr,Mm,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr,sr];var Uc=[tr,tr,uf,tr,xe,tr,Cd,tr,hp,tr,ip,tr,he,tr,gp,tr,ue,tr,zh,tr,Hi,tr,Nh,tr,Ci,tr,tr,tr,tr,tr,tr,tr];return{_testSetjmp:Sp,_strlen:Mp,_free:rp,_main:sd,_memcmp:Qp,_memmove:Op,__GLOBAL__I_a:ug,_memset:Pp,_malloc:qp,_saveSetjmp:Rp,_memcpy:Np,_realloc:sp,runPostSets:jd,stackAlloc:Vc,stackSave:Wc,stackRestore:Xc,setThrew:Yc,setTempRet0:$c,setTempRet1:ad,setTempRet2:bd,setTempRet3:cd,setTempRet4:dd,setTempRet5:ed,setTempRet6:fd,setTempRet7:gd,setTempRet8:hd,setTempRet9:id,dynCall_iiiiiiii:yq,dynCall_viiiii:zq,dynCall_vi:Aq,dynCall_vii:Bq,dynCall_ii:Cq,dynCall_iiiiiiiiiiii:Dq,dynCall_iiii:Eq,dynCall_viiiiiiiiiiiiiii:Fq,dynCall_viiiiid:Gq,dynCall_viiiiiiii:Hq,dynCall_viiiiii:Iq,dynCall_fiii:Jq,dynCall_viiiiiii:Kq,dynCall_viiiiiid:Lq,dynCall_viiiiiiiii:Mq,dynCall_viiiiiiiiii:Nq,dynCall_iii:Oq,dynCall_diii:Pq,dynCall_i:Qq,dynCall_iiiiii:Rq,dynCall_viii:Sq,dynCall_v:Tq,dynCall_iiiiiiiii:Uq,dynCall_iiiii:Vq,dynCall_viiii:Wq}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiiiiiii": invoke_iiiiiiii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_iiiiiiiiiiii": invoke_iiiiiiiiiiii, "invoke_iiii": invoke_iiii, "invoke_viiiiiiiiiiiiiii": invoke_viiiiiiiiiiiiiii, "invoke_viiiiid": invoke_viiiiid, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_fiii": invoke_fiii, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiiiid": invoke_viiiiiid, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_viiiiiiiiii": invoke_viiiiiiiiii, "invoke_iii": invoke_iii, "invoke_diii": invoke_diii, "invoke_i": invoke_i, "invoke_iiiiii": invoke_iiiiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiiiiiii": invoke_iiiiiiiii, "invoke_iiiii": invoke_iiiii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "__scanString": __scanString, "_fclose": _fclose, "_pthread_mutex_lock": _pthread_mutex_lock, "___cxa_end_catch": ___cxa_end_catch, "_strtoull": _strtoull, "_fflush": _fflush, "_fputc": _fputc, "_fwrite": _fwrite, "_send": _send, "_isspace": _isspace, "_read": _read, "_fsync": _fsync, "___cxa_guard_abort": ___cxa_guard_abort, "_newlocale": _newlocale, "___gxx_personality_v0": ___gxx_personality_v0, "_pthread_cond_wait": _pthread_cond_wait, "___cxa_rethrow": ___cxa_rethrow, "_fmod": _fmod, "___resumeException": ___resumeException, "_llvm_va_end": _llvm_va_end, "_vsscanf": _vsscanf, "_snprintf": _snprintf, "_fgetc": _fgetc, "__getFloat": __getFloat, "_atexit": _atexit, "___cxa_free_exception": ___cxa_free_exception, "_close": _close, "___setErrNo": ___setErrNo, "_isxdigit": _isxdigit, "_exit": _exit, "_sprintf": _sprintf, "___ctype_b_loc": ___ctype_b_loc, "_freelocale": _freelocale, "_catgets": _catgets, "__isLeapYear": __isLeapYear, "_asprintf": _asprintf, "___cxa_is_number_type": ___cxa_is_number_type, "___cxa_does_inherit": ___cxa_does_inherit, "___cxa_guard_acquire": ___cxa_guard_acquire, "___cxa_begin_catch": ___cxa_begin_catch, "_recv": _recv, "__parseInt64": __parseInt64, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_putchar": _putchar, "__ZNSt9exceptionD2Ev": __ZNSt9exceptionD2Ev, "_copysign": _copysign, "__exit": __exit, "_strftime": _strftime, "___cxa_throw": ___cxa_throw, "_pread": _pread, "_fopen": _fopen, "_open": _open, "__arraySum": __arraySum, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "__formatString": __formatString, "_pthread_cond_broadcast": _pthread_cond_broadcast, "__ZSt9terminatev": __ZSt9terminatev, "_isascii": _isascii, "_pthread_mutex_unlock": _pthread_mutex_unlock, "___cxa_call_unexpected": ___cxa_call_unexpected, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_strerror": _strerror, "_catclose": _catclose, "_llvm_lifetime_start": _llvm_lifetime_start, "___cxa_guard_release": ___cxa_guard_release, "_ungetc": _ungetc, "_uselocale": _uselocale, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_fread": _fread, "_abort": _abort, "_fprintf": _fprintf, "_isdigit": _isdigit, "_strtoll": _strtoll, "__addDays": __addDays, "_fabs": _fabs, "__reallyNegative": __reallyNegative, "_write": _write, "___cxa_allocate_exception": ___cxa_allocate_exception, "_longjmp": _longjmp, "_vasprintf": _vasprintf, "_catopen": _catopen, "___ctype_toupper_loc": ___ctype_toupper_loc, "___ctype_tolower_loc": ___ctype_tolower_loc, "_llvm_eh_typeid_for": _llvm_eh_typeid_for, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "_stderr": _stderr, "_stdout": _stdout, "__ZTISt9exception": __ZTISt9exception, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "___fsmu8": ___fsmu8, "___dso_handle": ___dso_handle }, buffer);
var _testSetjmp = Module["_testSetjmp"] = asm["_testSetjmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var __GLOBAL__I_a = Module["__GLOBAL__I_a"] = asm["__GLOBAL__I_a"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _saveSetjmp = Module["_saveSetjmp"] = asm["_saveSetjmp"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = asm["dynCall_iiiiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = asm["dynCall_iiiiiiiiiiii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = asm["dynCall_viiiiiiiiiiiiiii"];
var dynCall_viiiiid = Module["dynCall_viiiiid"] = asm["dynCall_viiiiid"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_fiii = Module["dynCall_fiii"] = asm["dynCall_fiii"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiid = Module["dynCall_viiiiiid"] = asm["dynCall_viiiiiid"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = asm["dynCall_viiiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_diii = Module["dynCall_diii"] = asm["dynCall_diii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






