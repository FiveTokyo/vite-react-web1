function _createForOfIteratorHelper(ob: any, allowArrayLike?: any) {
  let o = ob;
  var it: any;
  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it;
      var i = 0;
      var F = function F() {};
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        },
        e: function e(_e: any) {
          throw _e;
        },
        f: F,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    );
  }
  var normalCompletion = true,
    didErr = false,
    err: any;
  return {
    s: function s() {
      it = o[Symbol.iterator]();
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2: any) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}

function _toConsumableArray(arr: any) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError(
    'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
  );
}

function _unsupportedIterableToArray(o: Iterable<any> | ArrayLike<unknown>, minLen?: any) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _iterableToArray(iter: Iterable<unknown> | ArrayLike<unknown>) {
  if (typeof Symbol !== 'undefined' && Symbol.iterator in Object(iter))
    return Array.from(iter);
}

function _arrayWithoutHoles(arr: any) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayLikeToArray(arr: any, l?: any) {
  let len:any = l;
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

function ownKeys(object: any, enumerableOnly?: boolean | undefined) {
  const keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    let symbols: any = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function (sym: any) {
        return Object.getOwnPropertyDescriptor(object, sym)?.enumerable as any;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target: { id?: any; parentId?: any; }, ...args: any[]) {
  for (let i = 0; i < args.length; i++) {
    var source = args[i] != null ? args[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key) as any
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj: { [x: string]: any; }, key: string, value: any) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * 获取树状结构，如果已经是树状结构，直接返回
 * @param dataSource
 * @returns {*[]|*}
 */
export function getTreeData(d: any) {
  let dataSource = d;
  if (!dataSource) return []; // eslint-disable-next-line no-param-reassign

  if (!Array.isArray(dataSource)) dataSource = [dataSource]; // 含有children属性，已经是树状结构

  if (
    dataSource.find(function (item: { children: any; }) {
      return !!item.children;
    })
  )
    return dataSource;
  return convertToTree(dataSource);
}

/**
 * 转换为树状结构
 * @param rows
 * @param keyField
 * @param parentKeyField
 * @returns {*[]|*}
 */
export function convertToTree(r: any) {
  let rows = r;
  var keyField =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'id';
  var parentKeyField =
    arguments.length > 2 && arguments[2] !== undefined
      ? arguments[2]
      : 'parentId';
  if (!rows) return []; // 拷贝，多次执行修改原始的rows会出问题，指定id，parentId
  // eslint-disable-next-line no-param-reassign

  rows = rows.map(function (item: { [x: string]: any; }) {
    return _objectSpread(
      {
        id: item[keyField],
        parentId: item[parentKeyField],
      },
      item
    );
  }); // 获取所有的顶级节点

  var nodes = rows.filter(function (item: { parentId: any; }) {
    return !rows.find(function (r: { id: any; }) {
      return r.id === item.parentId;
    });
  }); // 存放要处理的节点

  var toDo: any = _toConsumableArray(nodes);

  var _loop = function _loop() {
    // 处理一个，头部弹出一个。
    var node = toDo.shift(); // 获取子节点。

    rows.forEach(function (child: { parentId: any; }) {
      if (child.parentId === node.id) {
        if (node.children) {
          node.children.push(child);
        } else {
          node.children = [child];
        } // child加入toDo，继续处理

        toDo.push(child);
      }
    });
  };

  while (toDo.length) {
    _loop();
  }

  return nodes;
}

/**
 * 获取所有的父节点
 * @param treeData 树状结构数据
 * @param fieldValue 用于查找的值
 * @param field 用户查找的键，默认 id
 * @returns {*|[]}
 */

export function findParentNodes(treeData: any[], fieldValue: any) {
  var field =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
  // eslint-disable-next-line no-param-reassign
  treeData = Array.isArray(treeData) ? treeData : [treeData]; // 深度遍历查找

  function dfs(data: string | any[], fieldValue: any, parents: any[]) {
    // eslint-disable-next-line no-plusplus
    for (var i = 0; i < data.length; i++) {
      var item = data[i]; // 找到id则返回父级id

      if (item[field] === fieldValue) return parents; // children不存在或为空则不递归
      // eslint-disable-next-line no-continue

      if (!item.children || !item.children.length) continue; // 往下查找时将当前id入栈

      parents.push(item);
      if (dfs(item.children, fieldValue, parents).length) return parents; // 深度遍历查找未找到时当前id 出栈

      parents.pop();
    } // 未找到时返回空数组

    return [];
  }

  return dfs(treeData, fieldValue, []);
}
/**
 * 根据指定数据的键值对，查找node，默认基于id查找，比如根据path查找： getNode(treeData, 'path', '/user/list')
 * @param {Array} treeData 树状结构数据
 * @param {String} field key值，比如 'path'，'text' 等节点数据属性，默认id
 * @param {*} fieldValue 节点属性所对应的数据
 * @param {Function} [compare] 节点属性所对应的数据比较方式， 默认 === 比对
 * @returns {object} 返回根据 key value查找到的节点
 */

export function findNode(treeData: string | any[], fieldValue: any, ...args: any[]) {
  var field =
    args.length > 0 && args[0] !== undefined ? args[0] : 'id';
  var compare =
    args.length > 1 && args[1] !== undefined
      ? arguments[1]
      : function (a: any, b: any) {
          var item =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : {};
          return a === b;
        };
  // eslint-disable-next-line no-param-reassign
  treeData = Array.isArray(treeData) ? treeData : [treeData];
  if (!treeData || !treeData.length) return null;
  var node = null;

  var loop = function loop(data: any) {
    // eslint-disable-next-line no-restricted-syntax
    var _iterator = _createForOfIteratorHelper(data),
      _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done; ) {
        var item = _step.value;

        if (compare(item[field], fieldValue, item)) {
          node = _objectSpread({}, item);
          break;
        }

        if (item.children && item.children.length) {
          loop(item.children);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  loop(treeData);
  return node;
}
/**
 * 查找给定节点，及其后代节点property属性，第一个不为空的值
 * @param {Array} treeData 节点数据，树状结构
 * @param {String} field 属性，比如 key， path等
 * @returns {*}
 */

export function getFirstNode(treeData: any[], field: string | number) {
  // eslint-disable-next-line no-param-reassign
  if (!Array.isArray(treeData)) treeData = [treeData];

  var loop = function loop(nodes: any): any {
    // eslint-disable-next-line no-restricted-syntax
    var _iterator2 = _createForOfIteratorHelper(nodes),
      _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
        var node = _step2.value;
        if (node[field]) return node;
        var result = loop(node.children || []);
        if (result) return result;
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  };

  return loop(treeData);
}
/**
 * 返回下一个兄弟节点
 * 如果是最后一个，返回上一个兄弟节点，
 * 如果是唯一子节点，返回父节点
 * @param treeData
 * @param key
 * @param keyField
 */

export function findNextNode(treeData: any[], key: any) {
  var keyField =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
  // eslint-disable-next-line no-param-reassign
  if (!Array.isArray(treeData)) treeData = [treeData];
  var parentNode = findParentNode(treeData, key, keyField);
  var dataSource = parentNode ? parentNode.children || [] : treeData;
  if (!dataSource || !dataSource.length) return null;
  if (dataSource.length === 1) return parentNode;
  var index = dataSource.findIndex(function (item: { [x: string]: any; }) {
    return item[keyField] === key;
  }); // 最后一个

  if (index === dataSource.length - 1) return dataSource[index - 1];
  return dataSource[index + 1];
}
/**
 * 获取父级节点
 * @param treeData
 * @param key
 * @param keyField
 * @returns {{children}|*}
 */

export function findParentNode(treeData: any[], key: any, ...args: any[]) {
  var keyField =
    args.length > 0 && args[0] !== undefined ? args[0] : 'id';
  // eslint-disable-next-line no-param-reassign
  if (!Array.isArray(treeData)) treeData = [treeData];

  var loop = function loop(nodes: any): any {
    // eslint-disable-next-line no-restricted-syntax
    var _iterator3 = _createForOfIteratorHelper(nodes),
      _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
        var node = _step3.value;

        if (node && node.children) {
          if (
            node.children.some(function (item: { [x: string]: any; }) {
              return item[keyField] === key;
            })
          ) {
            return node;
          }

          var result = loop(node.children);
          if (result) return result;
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    return null;
  };

  return loop(treeData);
}
/**
 * 过滤树
 * @param treeData
 * @param filter 过滤函数
 * @returns {*[]|*}
 */

export function filterTree(t: any) {
  let treeData = t;
  var filter =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : function (node: any) {
          return true;
        };
  if (!treeData) return []; // eslint-disable-next-line no-param-reassign

  if (!Array.isArray(treeData)) treeData = [treeData];

  var getNodes = function getNodes(result: any[], node: { children: any[]; }) {
    if (filter(node)) {
      result.push(node);
      return result;
    }

    if (Array.isArray(node.children)) {
      var children = node.children.reduce(getNodes, []);
      if (children.length)
        result.push(
          _objectSpread(
            _objectSpread({}, node),
            {},
            {
              children: children,
            }
          )
        );
    }

    return result;
  };

  return treeData.reduce(getNodes, []);
}
/**
 * 获取所有后代节点
 * @param treeData
 * @param fieldValue
 * @param field
 * @returns {*[]}
 */

export function findGenerationNodes(treeData: any, fieldValue: any) {
  const field =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
  // @ts-ignore
  const node: any = findNode(treeData, fieldValue, field);
  if (!node) return [];
  if (!node.children || !node.children.length) return [];
  const results: any[] = [];

  const loop = function loop(nodes: any[]) {
    return nodes.forEach(function (item: { children: any[]; }) {
      results.push(item);
      if (item.children && item.children.length) loop(item.children);
    });
  };

  loop(node.children);
  return results;
}
/**
 * 删除节点
 * @param treeData
 * @param key
 * @param keyField
 */

export function removeNode(t: any, key: any) {
  let treeData = t;
  var keyField =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
  if (!treeData) return null; // eslint-disable-next-line no-param-reassign

  if (!Array.isArray(treeData)) treeData = [treeData];

  var loop = function loop(data: any[]) {
    // eslint-disable-next-line no-plusplus
    for (var i = 0; i < data.length; i++) {
      var item = data[i];

      if (item[keyField] === key) {
        data.splice(i, 1);
        break;
      } else if (item.children && item.children.length) {
        loop(item.children);
      }
    }
  };

  loop(treeData);
}
/**
 * 渲染树，cb(node[, children nodes])
 * @param {Array} treeData 树的树状结构数据
 * @param {function} cb 回调函数：cb(node[, children nodes])
 */

export function renderNode(treeData: any, cb: (arg0: any, arg1?: any) => any) {
  var loop = function loop(data: any[]): any {
    return data.map(function (item: { children: any; }) {
      if (item.children) {
        return cb(item, loop(item.children)); // item children Item
      }

      return cb(item); // 叶子节点
    });
  };

  return loop(treeData);
}
/**
 * 查找keys中对应树的叶子节点，如果keys为null或undefined，查找树中所有叶子节点
 * @param treeData
 * @param keys
 * @param keyField
 */

export function findLeafNodes(t: any, keys: string | any[]) {
  let treeData = t;
  var keyField =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'id';
  if (!treeData) return []; // eslint-disable-next-line no-param-reassign

  if (!Array.isArray(treeData)) treeData = [treeData];

  var keysIncludes = function keysIncludes(node: { [x: string]: any; }) {
    if (!keys || !Array.isArray(keys)) return true; // 查找所有叶子节点

    return keys.includes(node[keyField]);
  };

  var result: any[] = [];

  var loop = function loop(nodes: any[]): any {
    return nodes.forEach(function (node: { children: any[]; }) {
      if (node.children && node.children.length) return loop(node.children);
      if (keysIncludes(node)) result.push(node);
    });
  };

  loop(treeData);
  return result;
}
