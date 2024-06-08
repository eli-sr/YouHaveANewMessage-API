create table message (
    id integer primary key autoincrement,
    content text not null,
    ip_user char(15) not null
)

create table reply (
    id integer,
    content text not null,
    id_message integer not null,
    primary key (id, id_message),
    foreign key (id_message) references message(id)
)