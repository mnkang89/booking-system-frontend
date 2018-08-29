import moment from "moment";

export const intervalMinutes = 30;
export const interval = moment.duration(intervalMinutes, "minutes");
export const min = moment("08:00", "HH:mm");
export const max = moment("24:00", "HH:mm");

export const displayCell = (xx) => {
  return xx.text;
}

export const calcHeight = (xx) => {
  return moment(xx.end, "h:mma").diff(moment(xx.start, "h:mma")) / interval;
}

export const displayHeader = (xx) => {
  return xx.name;
}

export const isActive = (xx, step) => {
  const current = moment(min).add(step * interval);

  return (
    moment(xx.start, "h:mma") <= current && current < moment(xx.end, "h:mma")
  );
}

export const showTime = (step) => {
  const start = moment(min).add(interval * step);
  const end = moment(start).add(interval);

  return `${start.format("h:mma")}–${end.format("h:mma")}`;
}

export const key = (xx) => {
  return xx.text;
}
