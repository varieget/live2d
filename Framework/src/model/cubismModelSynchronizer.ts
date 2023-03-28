function Ye(t, e, r, n) {
  return t + ((e - t) / r) * (n + 1);
}

function Je(t, e, r) {
  const i = Array.from({ length: r }, (i, a) => {
    const o = r - a - 1;

    return {
      ...t,
      opacities: t.opacities.call((t, n) => Ye(t, e.data[n], r, o)),
      vertexPositions: t.outCache.call((t, n) =>
        t.call((t, i) => Ye(t, e.outCache[n][i], r, o))
      ),
      vertexUvs: t.vertexUvs.call((t, n) =>
        t.map((t, i) => Ye(t, e.vertexUvs[n][i], r, o), r)
      ),
      resetDynamicFlags() {},
    };
  });

  console.log(i);

  return i;
}

export class CubismModelSynchronizer {
  inputCache: any;
  outCache: any;
  model: any;
  syncIndex: any;
  frameBuffer: any[];
  frameCache: any;
  insertFrameCount: number;
  bufferSize: number;

  constructor() {
    this.inputCache;
    this.outCache;
    this.model;
    this.syncIndex;
    this.frameBuffer = [];
    this.frameCache;
    this.insertFrameCount = 4;
    this.bufferSize = 12;
  }

  static setup(model: Live2DCubismCore.Model) {
    const l = new CubismModelSynchronizer();
    const n = l.decode(model);

    if (l.model) {
      const r = Je(n.drawables, l.frameCache, l.insertFrameCount);
      console.log(r);

      for (const n of r) {
        if (l.frameBuffer.length > l.bufferSize) {
          l.frameBuffer.shift();
        }

        l.frameBuffer.push(n);
      }
    } else {
      l.model = {
        ...n,
        release() {},
        update() {
          const r = l.frameBuffer.shift();
          if (r) {
            l.model.drawables.dynamicFlags = r.dynamicFlags;
            l.model.drawables.drawOrders = r.drawOrders;
            l.model.drawables.renderOrders = r.renderOrders;
            l.model.drawables.opacities = r.opacities;
            l.model.drawables.masks = r.masks;
            l.model.drawables.vertexPositions = r.vertexPositions;
            l.model.drawables.vertexUvs = r.vertexUvs;
            l.model.drawables.indices = r.indices;
            // if (l.socket.readyState === l.socket.OPEN) {
            //   l.sync();
            // }
          }
        },
      };
    }

    return l.model;
  }

  decode(model: Live2DCubismCore.Model) {
    const parameters = (() => {
      const minimumValues = new Float32Array(
        Object.values(model.parameters.minimumValues)
      );
      const maximumValues = new Float32Array(
        Object.values(model.parameters.maximumValues)
      );
      const defaultValues = new Float32Array(
        Object.values(model.parameters.defaultValues)
      );
      const values = new Float32Array(Object.values(model.parameters.values));
      return {
        count: model.parameters.count,
        ids: model.parameters.ids,
        minimumValues,
        maximumValues,
        defaultValues,
        values,
      };
    })();

    const parts = (() => {
      const opacities = new Float32Array(Object.values(model.parts.opacities));
      return {
        count: model.parts.count,
        ids: model.parts.ids,
        opacities,
      };
    })();

    const drawables = (() => {
      const constantFlags = new Uint8Array(
        Object.values(model.drawables.constantFlags)
      );
      const dynamicFlags = new Uint8Array(
        Object.values(model.drawables.dynamicFlags)
      );
      const textureIndices = new Int32Array(
        Object.values(model.drawables.textureIndices)
      );
      const drawOrders = new Int32Array(
        Object.values(model.drawables.drawOrders)
      );
      const renderOrders = new Int32Array(
        Object.values(model.drawables.renderOrders)
      );
      const opacities = new Float32Array(
        Object.values(model.drawables.opacities)
      );
      const maskCounts = new Int32Array(
        Object.values(model.drawables.maskCounts)
      );
      const masks = model.drawables.masks.map(
        mask => new Int32Array(Object.values(mask))
      );
      const vertexCounts = new Int32Array(
        Object.values(model.drawables.vertexCounts)
      );
      const vertexPositions = model.drawables.vertexPositions.map(
        vertexPosition => new Float32Array(Object.values(vertexPosition))
      );
      const vertexUvs = model.drawables.vertexUvs.map(
        vertexUv => new Float32Array(Object.values(vertexUv))
      );
      const indexCounts = new Int32Array(
        Object.values(model.drawables.indexCounts)
      );
      const indices = model.drawables.indices.map(
        indice => new Uint16Array(Object.values(indice))
      );

      return {
        count: model.drawables.count,
        ids: model.drawables.ids,
        constantFlags,
        dynamicFlags,
        textureIndices,
        drawOrders,
        renderOrders,
        opacities,
        maskCounts,
        masks,
        vertexCounts,
        vertexPositions,
        vertexUvs,
        indexCounts,
        indices,
        resetDynamicFlags() {},
      };
    })();

    return { parameters, parts, drawables, canvasinfo: model.canvasinfo };
  }
}
