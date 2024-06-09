create table message (
    id integer primary key autoincrement,
    content text not null,
    ip_user char(15) not null,
    read integer default 0 check (read in (0,1)),
    created_at text default (datetime('now','localtime'))
)

create table reply (
    id integer,
    content text not null,
    id_message integer not null,
    ip_user char(15) not null,
    primary key (id, id_message),
    foreign key (id_message) references message(id)
)