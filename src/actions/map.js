export const SHOW_AREA = "SHOW_AREA";

export const showArea = (b, ukey) => ({
    type: SHOW_AREA,
    ukey: ukey,
    showArea: b
});
