import zipfile, pickle, numpy as np, onnx
from onnx import helper, TensorProto, numpy_helper
z=zipfile.ZipFile('animev3.pth'); names=z.namelist(); root=names[0].split('/')[0]
class Stor:
    def __init__(s,key,dtype): s.key=key; s.dtype=dtype
def rebuild(storage, offset, size, stride, *a):
    raw=np.frombuffer(z.read(f'{root}/data/{storage.key}'),dtype=storage.dtype)
    n=int(np.prod(size)) if size else 1
    return np.lib.stride_tricks.as_strided(raw[offset:], shape=size, strides=[st*raw.itemsize for st in stride]).copy() if size else raw[offset:offset+1].copy()
DT={'FloatStorage':np.float32,'HalfStorage':np.float16}
class U(pickle.Unpickler):
    def find_class(s,mod,name):
        if name=='_rebuild_tensor_v2': return rebuild
        if name in DT: return name
        if mod=='collections' and name=='OrderedDict':
            import collections; return collections.OrderedDict
        return super().find_class(mod,name)
    def persistent_load(s,pid):
        _,stype,key,loc,n=pid; return Stor(key,DT[stype])
sd=U(z.open(f'{root}/data.pkl')).load()
sd=sd.get('params',sd); keys=sorted(sd,key=lambda k:(int(k.split('.')[1]),k)); print(len(keys), keys[:4], keys[-2:])
nodes=[]; inits=[]; x='input'; idx=sorted(set(int(k.split('.')[1]) for k in keys))
for i in idx:
    w=sd.get(f'body.{i}.weight'); b=sd.get(f'body.{i}.bias')
    if w.ndim==4:
        inits+= [numpy_helper.from_array(w.astype(np.float32),f'w{i}'), numpy_helper.from_array(b.astype(np.float32),f'b{i}')]
        nodes.append(helper.make_node('Conv',[x,f'w{i}',f'b{i}'],[f'c{i}'],pads=[1,1,1,1])); x=f'c{i}'
    else:
        inits.append(numpy_helper.from_array(w.astype(np.float32).reshape(-1,1,1),f'p{i}'))
        nodes.append(helper.make_node('PRelu',[x,f'p{i}'],[f'a{i}'])); x=f'a{i}'
nodes.append(helper.make_node('DepthToSpace',[x],['ds'],blocksize=4,mode='CRD'))
inits.append(numpy_helper.from_array(np.array([1,1,4,4],dtype=np.float32),'scales'))
nodes.append(helper.make_node('Resize',['input','','scales'],['up'],mode='nearest'))
nodes.append(helper.make_node('Add',['ds','up'],['output']))
g=helper.make_graph(nodes,'srvgg',[helper.make_tensor_value_info('input',TensorProto.FLOAT,[1,3,None,None])],[helper.make_tensor_value_info('output',TensorProto.FLOAT,[1,3,None,None])],inits)
m=helper.make_model(g,opset_imports=[helper.make_opsetid('',13)]); m.ir_version=8; onnx.checker.check_model(m); onnx.save(m,'animev3.onnx'); print('ok')
