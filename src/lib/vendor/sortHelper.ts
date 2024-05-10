export function fieldSorter(fields: any[]) {
    var dir: any[] = [], i, l = fields.length;
    fields = fields.map(function(o, i) {
        if (o[0] === "-") {
            dir[i] = -1;
            o = o.substring(1);
        } else {
            dir[i] = 1;
        }
        return o;
    });
  
    return function (a: any, b: any) {
        for (i = 0; i < l; i++) {
            var o = fields[i];
            if (a[o] > b[o]) return dir[i];
            if (a[o] < b[o]) return -(dir[i]);
        }
        return 0;
    };
}