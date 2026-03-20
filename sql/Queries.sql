USE ProjectDB;
GO

SELECT *
FROM users

DELETE FROM users 
WHERE id = 12;

DELETE FROM Users 
WHERE id IN (6, 12, 14, 16, 21, 24, 26, 28, 29, 31, 32);

EXEC spAddNewUser 'Noa Cohen', 'noa@gmail.com', 'pass123', 22, 'Israel';
EXEC spAddNewUser 'David Mizrahi', 'david.m@outlook.com', 'david2026', 34, 'Israel';
EXEC spAddNewUser 'Sarah Miller', 'sarah.m@yahoo.com', 'sarah789', 29, 'USA';
EXEC spAddNewUser 'Yossi Haddad', 'yossi@gmail.com', 'yossi321', 41, 'Israel';
EXEC spAddNewUser 'Elena Petrova', 'elena.p@mail.ru', 'elena99', 27, 'Russia';
EXEC spAddNewUser 'Marco Rossi', 'marco.rossi@libero.it', 'marco456', 31, 'Italy';
EXEC spAddNewUser 'Maya Avraham', 'maya.a@gmail.com', 'maya111', 24, 'Israel';
EXEC spAddNewUser 'James Wilson', 'james.w@gmail.com', 'james_best', 38, 'UK';
EXEC spAddNewUser 'Chen Wang', 'chen.wang@techtalk.com', 'chen88', 26, 'China';
EXEC spAddNewUser 'John Smith', 'john.s@gmail.com', 'pass1234', 28, 'USA';
EXEC spAddNewUser 'Yuki Tanaka', 'yuki.t@yahoo.jp', 'tanaka99', 24, 'Japan';
EXEC spAddNewUser 'Hans Müller', 'hans.m@berlin.de', 'hans2024', 35, 'Germany';
EXEC spAddNewUser 'Chloe Lefebvre', 'chloe.l@paris.fr', 'chloe_pass', 22, 'France';
EXEC spAddNewUser 'Mateo Garcia', 'mateo.g@madrid.es', 'mateo7788', 31, 'Spain';
EXEC spAddNewUser 'Giuseppe Rossi', 'g.rossi@roma.it', 'giu123', 27, 'Italy';
EXEC spAddNewUser 'Emma Wilson', 'emma.w@london.uk', 'emma_best', 29, 'United Kingdom';
EXEC spAddNewUser 'Aarav Sharma', 'aarav.s@delhi.in', 'sharma_adi', 26, 'India';
EXEC spAddNewUser 'Li Wei', 'li.wei@beijing.cn', 'li_pass', 33, 'China';
EXEC spAddNewUser 'Sofia Silva', 'sofia.s@rio.br', 'sofia_z', 25, 'Brazil';
EXEC spAddNewUser 'Lars Jensen', 'lars.j@oslo.no', 'lars4455', 40, 'Norway';
EXEC spAddNewUser 'Fatima Ahmed', 'fatima.a@dubai.ae', 'fatima_k1', 23, 'UAE';
EXEC spAddNewUser 'Dmitry Volkov', 'dmitry.v@moscow.ru', 'dmitry_v', 32, 'Russia';
EXEC spAddNewUser 'Ji-Hoon Kim', 'jihoon.k@seoul.kr', 'kim_h', 30, 'South Korea';
EXEC spAddNewUser 'Isabella Conti', 'isabella.c@buenosaires.ar', 'isa_a', 34, 'Argentina';
EXEC spAddNewUser 'Sven Svensson', 'sven.s@stockholm.se', 'sven_p', 21, 'Sweden';
EXEC spAddNewUser 'Maria Rodriguez', 'maria.r@mexico.mx', 'maria_s', 28, 'Mexico';
EXEC spAddNewUser 'Ahmed Hassan', 'ahmed.h@cairo.eg', 'ahmed_g', 27, 'Egypt';
EXEC spAddNewUser 'Oliver Brown', 'oliver.b@sydney.au', 'oliver_n', 36, 'Australia';
EXEC spAddNewUser 'Sophie van den Berg', 'sophie.v@amsterdam.nl', 'sophie_b', 29, 'Netherlands';
EXEC spAddNewUser 'Klaus Schmidt', 'klaus.s@vienna.at', 'klaus_g', 31, 'Austria';
EXEC spAddNewUser 'Elena Popova', 'elena.p@sofia.bg', 'elena_d', 24, 'Bulgaria';
EXEC spAddNewUser 'James Miller', 'james.m@toronto.ca', 'james_r', 38, 'Canada';
EXEC spAddNewUser 'Tariq Al-Fahad', 'tariq.a@riyadh.sa', 'tariq_o', 33, 'Saudi Arabia';
EXEC spAddNewUser 'Nina Ivanova', 'nina.i@kyiv.ua', 'nina_g', 26, 'Ukraine';
EXEC spAddNewUser 'Luca Steiner', 'luca.s@zurich.ch', 'luca_s', 42, 'Switzerland';
EXEC spAddNewUser 'Anika Fischer', 'anika.f@warsaw.pl', 'anika_n', 45, 'Poland';
EXEC spAddNewUser 'Diego Torres', 'diego.t@lima.pe', 'diego_d', 22, 'Peru';
EXEC spAddNewUser 'Kim Nguyen', 'kim.n@hanoi.vn', 'kim_m', 37, 'Vietnam';
EXEC spAddNewUser 'Zoe Papadopoulos', 'zoe.p@athens.gr', 'zoe_r', 30, 'Greece';