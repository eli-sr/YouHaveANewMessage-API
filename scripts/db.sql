create table message (
    id integer primary key autoincrement,
    content text not null check (length(content) <= 140),
    ip_user char(45) not null,
    read integer not null default 0 check (read in (0,1)),
    created_at text not null default (datetime('now','localtime'))
);

create table reply (
    id_message integer primary key,
    content text not null check (length(content) <= 140),
    ip_user char(45) not null,
    foreign key (id_message) references message(id)
);