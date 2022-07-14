const scriptName = "Game";

importPackage(javax.net.ssl);
importPackage(java.lang);
importPackage(java.net);
importPackage(java.io);

const Hangul = require("hangul");
const GamingRoom = {"끝말잇기":{}, "가위바위보":{}};
const PATH = "/storage/emulated/0/GAME_DATA/";
const REG = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
const TIMELIMIT = 60000;
const CMDPREFIX = '.';
let Today = new Date();
let APICount = 0;
let sslContext = SSLContext.getInstance("SSL");
sslContext.init(null, [new JavaAdapter(X509TrustManager, {
  getAcceptedIssuers : () => { return null; },
  checkClientTrusted : () => { return ; },
  checkServerTrusted : () => { return ; },
})], new java.security.SecureRandom());
HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());
HttpsURLConnection.setDefaultHostnameVerifier(new JavaAdapter(HostnameVerifier, {verify : (hostname, session) => { return true; }}));

/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName)
{ 
  let Allow_room = []; // 이곳에 방 이름을 넣을 것 ex) ["방이름1"] or ["방이름1", 방이름2, . . . . ]
  
  if (Allow_room.indexOf(room) < 0) {return false;}

  let reg_room = room.replace(REG, '');
  reg_room = reg_room.replace(/ /g, '_');

  let OriginMsg = msg+"";
  let talk = '';
  let descript = '';
  let choiceGame = "null";

  msg = msg.replace(REG, '').replace(/ /g, '').replace(/\\n/g, '');

  if (Today.getFullYear() !== (new Date()).getFullYear() || Today.getMonth() !== (new Date()).getMonth() || Today.getDate() !== (new Date()).getDate()) {Today = new Date(); APICount = 0;}
  if (msg === "수호야끝말잇기하자") {choiceGame = "끝말잇기"; descript = "|----사용 가능한 품사----|\n{    명사    |     대명사    }\n{ 의존명사 | 감탄사·명사 }\n\n|----사용 가능한 단어----|\n{   인명, 지명을 제외한   }\n{    나머지 일상·전문어   }\n{  표준어 | 방언 | 북한어 }\n\n|-------끝말잇기 명령어------|\n{   ''수호야 얼마나 남았어''   }\n{      ''수호야 그게 뭐야''      }\n{ ''수호야 내가 말한건 뭐야'' }\n\n|----------주의사항---------|\n{                 1                 }\n{       단어를 말할 때는      }\n{ 앞에 " + CMDPREFIX + " 를 붙여야 합니다. }\n{                 2                 }\n{     단어를 100번 주고     }\n{     받으면 승리합니다.     }\n\n|----남은 끝말잇기 횟수----|\n{            " + RemainApiCountFormatting() + "회            }\n\n\n난이도를 골라주세요.\n[ 쉽게 | 어렵게 ]중 택 1";}
  else if (msg === "수호야가위바위보하자") {choiceGame = "가위바위보"; descript = "전 이미 준비됐습니다!";}

  if (choiceGame !== "null")
  {
    if (GamingRoom[choiceGame][room] !== undefined)
    {
      if (Date.now() - GamingRoom[choiceGame][room][1] < TIMELIMIT)
      {
        replier.reply(room, "게임이 이미 진행 중 입니다.");
        return false;
      }
    }
    
    GamingRoom[choiceGame][room] = [sender, Date.now(), false, true, "null", [], [], 5, 0, 0, "null", false];
    replier.reply(room, descript);
  }
  else
  {
    if (GamingRoom["끝말잇기"][room] !== undefined)
    {
      if (msg === "수호야얼마나남았어")
      {
        talk = "게임주최자 : " + GamingRoom["끝말잇기"][room][0] + "\n남은 라운드 : " + (100 - GamingRoom["끝말잇기"][room][8]) + "번\n남은 시간 : " + parseInt((60000 - Date.now() + GamingRoom["끝말잇기"][room][1]) / 1000) + "초\n남은 기회 : " + GamingRoom["끝말잇기"][room][7] + "번";
      }
      else if (GamingRoom["끝말잇기"][room][0] === sender)
      {
        // [상대방 이름, 제한시간, 가위바위보 유무, 순서 유무, 현재 수호 단어, 지금까지 나온단어, 단어정보리스트, 기회, 라운드, 난이도, 현재 내 단어];
        // 1. 가위바위보로 순서 정함
        // 2. 순서에 따라 게임진행
        if (GamingRoom["끝말잇기"][room][6].length > 1 && msg === "수호야그게뭐야")
        {
          talk = "의미 : " + GamingRoom["끝말잇기"][room][6][GamingRoom["끝말잇기"][room][6].length-1][0] + "\n\n자세히 보기 : " + GamingRoom["끝말잇기"][room][6][GamingRoom["끝말잇기"][room][6].length-1][1];
        }
        else if (GamingRoom["끝말잇기"][room][6].length > 2 && msg === "수호야내가말한건뭐야")
        {
          talk = "의미 : " + GamingRoom["끝말잇기"][room][6][GamingRoom["끝말잇기"][room][6].length-2][0] + "\n\n자세히 보기 : " + GamingRoom["끝말잇기"][room][6][GamingRoom["끝말잇기"][room][6].length-2][1];
        }
        else if (GamingRoom["끝말잇기"][room][2] && GamingRoom["끝말잇기"][room][9] !== 0 && !GamingRoom["끝말잇기"][room][3]) talk = "지금은 할 수 없습니다.";
        else if (GamingRoom["끝말잇기"][room][9] === 0)
        {
          if (Date.now() - GamingRoom["끝말잇기"][room][1] >= TIMELIMIT)
          {
            GamingRoom["끝말잇기"][room] = undefined;
            talk = "시간초과로 게임을 종료합니다.";
          }
          else
          {
            if (msg === "어렵게") {GamingRoom["끝말잇기"][room][9] = 2; GamingRoom["끝말잇기"][room][7] = 3; talk = "난이도는 어려움으로 설정됐습니다.\n60초 안에 [ 가위 | 바위 | 보 ]중\n하나를 내주세요!";}
            else {GamingRoom["끝말잇기"][room][9] = 1; talk = "난이도는 쉬움으로 설정됐습니다.\n60초 안에 [ 가위 | 바위 | 보 ]중\n하나를 내주세요!";}
          }
        }
        else if (GamingRoom["끝말잇기"][room][2])
        {
          GamingRoom["끝말잇기"][room][3] = false;

          // 접두사 기호 체크
          if (OriginMsg[0] !== CMDPREFIX) {GamingRoom["끝말잇기"][room][3] = true; return true;}
          
          // 봐주기
          if (GamingRoom["끝말잇기"][room][11])
          {
            let borrow = -1;

            if (msg === "응")
            {
              // "응" 인 경우, 봐주기 확률
              borrow = Math.floor(Math.random()*100)+1;
            }

            // "아니" 인 경우, 적용x
            if (borrow >= 70)
            {
              GamingRoom["끝말잇기"][room][6].pop();
              msg = GamingRoom["끝말잇기"][room][5].pop();
              GamingRoom["끝말잇기"][room][4] = "null";
            }
            else
            {
              talk = (borrow === -1 ? "" : "싫습니다.\n") + CMDPREFIX + GamingRoom["끝말잇기"][room][4];
              GamingRoom["끝말잇기"][room][11] = false;
              GamingRoom["끝말잇기"][room][8]++;
              GamingRoom["끝말잇기"][room][5][GamingRoom["끝말잇기"][room][5].length] = GamingRoom["끝말잇기"][room][4];
              GamingRoom["끝말잇기"][room][3] = true;
              GamingRoom["끝말잇기"][room][1] = Date.now();
              replier.reply(room, talk);
              return;
            }
          }

          // 단어/시간 확인
          if (GamingRoom["끝말잇기"][room][5].indexOf(msg) >= 0)
          {
            GamingRoom["끝말잇기"][room][7]--;
            GamingRoom["끝말잇기"][room][3] = true;
            talk = "이미 나온 단어는 다시 사용 할 수 없습니다.\n(남은 기회 : " + GamingRoom["끝말잇기"][room][7] + "번)";
          }
          else if (APICount >= 50000)
          {
            GamingRoom["끝말잇기"][room] = undefined;
            talk = "오늘은 더 이상 끝말잇기를 할 수 없습니다.";
          }
          else if (Date.now() - GamingRoom["끝말잇기"][room][1] >= TIMELIMIT)
          {
            // 시간초과패
            GamingRoom["끝말잇기"][room] = undefined;
            talk = "🏴 제가 이겼습니다.\n시간초과패";
          }
          else if (GamingRoom["끝말잇기"][room][8] >= 100) {GamingRoom["끝말잇기"][room] = undefined; talk = "제가 졌습니다.\n라운드승";}
          else if (msg.length < 2)
          {
            GamingRoom["끝말잇기"][room][7]--;
            GamingRoom["끝말잇기"][room][3] = true;
            talk = "2글자 이상만 가능합니다.\n(남은 기회 : " + GamingRoom["끝말잇기"][room][7] + "번)";
          }
          else if (GamingRoom["끝말잇기"][room][4] === "null" || KorDivision(GamingRoom["끝말잇기"][room][4][GamingRoom["끝말잇기"][room][4].length-1], msg[0], 0))
          {
            // 단어 검색 -> 존재 유무 판단 - (있을경우) -> 시작단어 검색 후 출력
            //                           ㄴ (없을경우) -> 경고

            let resultWord = (GamingRoom["끝말잇기"][room][11]) ? msg : WordSearch(msg, 0, room, true);

            if (resultWord && resultWord === msg)
            {
              GamingRoom["끝말잇기"][room][10] = resultWord;
              GamingRoom["끝말잇기"][room][5][GamingRoom["끝말잇기"][room][5].length] = resultWord;
              GamingRoom["끝말잇기"][room][1] = Date.now();
              
              let myword = '';
              let possibleStartWord = KorDivision(msg[msg.length-1], '', 1);

              // 저장한 한방단어 존재유무 *****
              if (!GamingRoom["끝말잇기"][room][11] && GamingRoom["끝말잇기"][room][9] === 2)
              {
                for (let i = 0; i < possibleStartWord.length; i++)
                {
                  let check = FindOneStrikeWord(possibleStartWord[i]);
                  if (check) {myword = check; break;}
                }
              }

              GamingRoom["끝말잇기"][room][11] = false;

              if (myword === '')
              {
                for (let i = 0; i < possibleStartWord.length; i++)
                {
                  myword = WordSearch(possibleStartWord[i], 1, room, true);
                  if (myword) break;
                }
              }
              else if (Math.floor(Math.random()*100)+1 >= 70)
              {
                // 30% 확률로 봐주기 멘트 묻기
                // 변수 추가
                GamingRoom["끝말잇기"][room][11] = true;
                GamingRoom["끝말잇기"][room][4] = myword;
                GamingRoom["끝말잇기"][room][3] = true;
                GamingRoom["끝말잇기"][room][1] = Date.now();
                replier.reply(room, "흠... 봐드릴까요?\n\t(응 / 아니)");
                return;
              }

              if (Date.now() - GamingRoom["끝말잇기"][room][1] >= TIMELIMIT)
              {
                // 시간초과승
                talk = "제가 졌습니다.\n시간초과승";
                GamingRoom["끝말잇기"][room] = undefined;
              }
              else if (myword && myword.length >= 2 && KorDivision(resultWord[resultWord.length - 1], myword[0], 0))
              {
                talk = CMDPREFIX + myword;
                GamingRoom["끝말잇기"][room][8]++;
                GamingRoom["끝말잇기"][room][5][GamingRoom["끝말잇기"][room][5].length] = myword;
                GamingRoom["끝말잇기"][room][4] = myword;
                GamingRoom["끝말잇기"][room][3] = true;
                GamingRoom["끝말잇기"][room][1] = Date.now();
              }
              else
              {
                // 유효승
                // 한방단어 저장
                talk = "제가 졌습니다.\n유효승";
                GamingRoom["끝말잇기"][room] = undefined;
                // AddOneStrikeWord(resultWord); // <-- 한방단어인지 확실하게 하고 저장하기 *****************************************************************************************
              }
            }
            else if (resultWord === "#__FOUL__#")
            {
              // 유효패
              // 한방단어 저장
              talk = "🏴 제가 이겼습니다.\n반칙패";
              GamingRoom["끝말잇기"][room] = undefined;
              AddOneStrikeWord(msg);
            }
            else
            {
              // 경고
              GamingRoom["끝말잇기"][room][7]--;
              GamingRoom["끝말잇기"][room][3] = true;
              talk = "'우리말샘' 사전에 존재하지 않는 단어이거나 사용가능한 단어의 범위를 벗어난 단어입니다.\n(남은 기회 : " + GamingRoom["끝말잇기"][room][7] + "번)";
            }
          }
          else
          {
            // 경고
            GamingRoom["끝말잇기"][room][7]--;
            GamingRoom["끝말잇기"][room][3] = true;
            talk = "끝 말의 글자가 맞지 않습니다.\n(남은 기회 : " + GamingRoom["끝말잇기"][room][7] + "번)";
          }

          if (GamingRoom["끝말잇기"][room] !== undefined && GamingRoom["끝말잇기"][room][7] <= 0)
          {
            // 누적경고패
            GamingRoom["끝말잇기"][room] = undefined;
            talk = "🏴 제가 이겼습니다.\n유효패";
          }
        }
        else
        {
          let result = RockScissorPaper(room, msg, "끝말잇기");

          if (result[3] === "시간초과패")
          {
            GamingRoom["끝말잇기"][room] = undefined;
            talk = "시간초과로 게임을 종료합니다.";
          }
          else if (result[0] === true)
          {
            let wordList = ["해안가", "슴가", "간나", "핵사이다", "탈룰라", "대마", "꿀알바", "변호사", "부르주아", "유전자", "유아차", "엄카", "낙타", "비파", "치하", "아이티엑스청춘", "지름신", "디폴트값", "갱엿돼지족조림", "국룰"];
            let startWord = WordSearch(' ', 2, room, true);
            let index = Math.floor(Math.random() * wordList.length);
            startWord = (startWord) ? startWord : wordList[index];

            talk = "먼저 시작하겠습니다.\n(수호 : " + result[1] + " | " + sender + " : " + result[2] + ")\n\n" + CMDPREFIX + startWord;
            GamingRoom["끝말잇기"][room][8]++;
            GamingRoom["끝말잇기"][room][5][0] = startWord;
            GamingRoom["끝말잇기"][room][6][0] = ["모르겠어요.", "모르겠어요."];
            GamingRoom["끝말잇기"][room][4] = startWord;
            GamingRoom["끝말잇기"][room][2] = true;
            GamingRoom["끝말잇기"][room][1] = Date.now();
          }
          else if (result[0] === false)
          {
            talk = "아쉽네요,\n(수호 : " + result[1] + " | " + sender + " : " + result[2] + ")\n\n먼저 시작하세요. ex) " + CMDPREFIX + "나무, " + CMDPREFIX + "가지";
            GamingRoom["끝말잇기"][room][2] = true;
            GamingRoom["끝말잇기"][room][1] = Date.now();
          }
          else
          {
            talk = "비겼습니다.\n(수호 : " + result[1] + " | " + sender + " : " + result[2] + ")\n\n다시내주세요.";
          }
        }
      }
    }

    if (GamingRoom["가위바위보"][room] !== undefined)
    {
      if (GamingRoom["가위바위보"][room][0] === sender)
      {
        let result = RockScissorPaper(room, msg, "가위바위보");
        if (result[0] === true)
        {
          talk = "    🏴" + result[3] + "🏴\n제가 이겼습니다.\n(수호 : " + result[1] + " | " + sender + " : " + result[2] + ")";
        }
        else if (result[0] === false)
        {
          talk = "아쉽네요, 제가 졌습니다.\n(수호 : " + result[1] + " | " + sender + " : " + result[2] + ")";
        }
        else
        {
          talk = "비겼습니다.\n(수호 : " + result[1] + " | " + sender + " : " + result[2] + ")";
        }

        GamingRoom["가위바위보"][room] = undefined;
      }
    }

    replier.reply(room, talk);
  }
}

function RockScissorPaper(room, msg, game)
{
  let Hand = ["가위", "바위", "보"];
  let HandIco = ["✌", "✊", "🖐"];
  let MyHand = HandIco[Math.floor(Math.random() * 3)];
  let YourHand = msg;

  if (Hand.indexOf(YourHand) >= 0) YourHand = HandIco[Hand.indexOf(YourHand)];
  else if (HandIco.indexOf(YourHand) >= 0) {}
  else return [true, MyHand, YourHand, "반칙패"];
  if (Date.now() - GamingRoom[game][room][1] >= TIMELIMIT) return [true, MyHand, YourHand, "시간초과패"];

  if (MyHand === "✌" && YourHand === "✌") return [null, MyHand, YourHand, "무승부"];
  else if (MyHand === "✌" && YourHand === "✊") return [false, MyHand, YourHand, "유효승"];
  else if (MyHand === "✌" && YourHand === "🖐") return [true, MyHand, YourHand, "유효패"];
  else if (MyHand === "✊" && YourHand === "✌") return [true, MyHand, YourHand, "유효패"];
  else if (MyHand === "✊" && YourHand === "✊") return [null, MyHand, YourHand, "무승부"];
  else if (MyHand === "✊" && YourHand === "🖐") return [false, MyHand, YourHand, "유효승"];
  else if (MyHand === "🖐" && YourHand === "✌") return [false, MyHand, YourHand, "유효승"];
  else if (MyHand === "🖐" && YourHand === "✊") return [true, MyHand, YourHand, "유효패"];
  else if (MyHand === "🖐" && YourHand === "🖐") return [null, MyHand, YourHand, "무승부"];
}

function WordSearch(msg, state, room, save)
{
  // 상대방 단어(msg) 사전 search -> index[-1] API 검색

  if (APICount >= 50000) return false;

  const APIURL = "https://opendict.korean.go.kr/api/search";
  const KEY = "E23F6E2BAA31A6FD8487F69D94AB7F21";

  let cat = '';
  let query = msg;
  let Result = '';
  let StringLink = '';
  let StringWordArray = [];
  let StringDefinition = '';
  let TotalCount = 0;
  let temporary = [];
  let tempLink = [];
  let tempDef = [];
  
  for (let i = 1; i < 67; i++)
  {
    if (i !== 46 && i !== 57) cat += i + ',';
  }
  cat += "67";

  try
  {
    let sortMethod = ["popular", "date", "dict"];
    let index = Math.floor(Math.random() * 3);

    while (sortMethod.length > 0)
    {
      if (Date.now() - GamingRoom["끝말잇기"][room][1] >= TIMELIMIT) return false;
      let type4 = ["general", "technical"];
      let type4_index = Math.floor(Math.random() * 2);

      while (type4.length > 0)
      {
        if (Date.now() - GamingRoom["끝말잇기"][room][1] >= TIMELIMIT) return false;
        if (APICount >= 50000) return false;

        switch (state)
        {
          case 0 :
          {
            // 0번 index <Word> 출력
            APICount++;
            
            let DictDocument = org.jsoup.Jsoup
            .connect(APIURL)
            .data("key", KEY)
            .data("q", query)
            .data("sort", sortMethod[index])
            .data("advanced", "y")
            .data("type1", "word")
            .data("type3", "general,dialect,nkorean")
            .data("type4", type4[type4_index])
            .data("pos", "1,2,11,18")
            .data("cat", cat)
            .data("letter_s", "2")
            .data("letter_e", "80")
            .parser(org.jsoup.parser.Parser.xmlParser())
            .get();

            TotalCount = parseInt(DictDocument.getElementsByTag("total").eachText().get(0));

            if (TotalCount > 0)
            {
              type4 = [];
              sortMethod = [];
              StringLink = DictDocument.getElementsByTag("link").eachText().get(1);
              StringDefinition = DictDocument.getElementsByTag("definition").eachText().get(0);
              Result = DictDocument.getElementsByTag("word").eachText()[0].replace(REG, '').replace(/ /g, '');

              if (GamingRoom["끝말잇기"][room][8] === 0)
              {
                let isOneStrike = WordSearch(Result[Result.length-1], 1, room, false);
                if (!isOneStrike) return "#__FOUL__#";
              }
            }
            break;
          }
          case 2 :
          {
            // 아무거나 index <Word> 출력
            APICount++;
            
            let DictDocument = org.jsoup.Jsoup
            .connect(APIURL)
            .data("key", KEY)
            .data("q", query)
            .data("sort", sortMethod[index])
            .data("advanced", "y")
            .data("type1", "word")
            .data("type2", "hybrid")
            .data("type3", "general,dialect,nkorean")
            .data("type4", type4[type4_index])
            .data("pos", "1,2,11,18")
            .data("cat", cat)
            .data("letter_s", "2")
            .data("letter_e", "80")
            .parser(org.jsoup.parser.Parser.xmlParser())
            .get();

            TotalCount = parseInt(DictDocument.getElementsByTag("total").eachText().get(0));

            if (TotalCount > 0)
            {
              let Check = DictDocument.getElementsByTag("word").eachText();
  
              while (Check.size() > 0)
              {
                if (Date.now() - GamingRoom["끝말잇기"][room][1] >= TIMELIMIT) return false;
                let AnyOneIndex = Math.floor(Math.random() * Check.size());
                let CheckChr = Check.get(AnyOneIndex).replace(REG, '').replace(/ /g, '');
                let isExist = true;

                if (GamingRoom["끝말잇기"][room][9] === 2)
                {
                  let initialLaw = KorDivision(CheckChr[CheckChr.length-1], '', 1);
                  for (let k = 0; k < initialLaw.length; k++)
                  {
                    if (FindOneStrikeWord(initialLaw[k]))
                    {
                      isExist = false;
                      tempDef[tempDef.length] = DictDocument.getElementsByTag("definition").eachText().get(AnyOneIndex);
                      tempLink[tempLink.length] = DictDocument.getElementsByTag("link").eachText().get(AnyOneIndex+1);
                      temporary[temporary.length] = CheckChr;
                      break;
                    }
                  }
                }
                if (isExist)
                {
                  let temp = WordSearch(CheckChr[CheckChr.length-1], 1, room, false);
                  if (temp)
                  {
                    type4 = [];
                    sortMethod = [];
                    StringLink = DictDocument.getElementsByTag("link").eachText().get(AnyOneIndex+1);
                    StringDefinition = DictDocument.getElementsByTag("definition").eachText().get(AnyOneIndex);
                    Result = CheckChr;
                    break;
                  }
                  else
                  {
                    AddOneStrikeWord(temp);
                  }
                }
                Check.remove(AnyOneIndex);
              }
            }
            break;
          }
          case 1 :
          {
            let Check = '';
            let Word_Index = 0;

            for (let i = 1; i <= 1000; i++)
            {
              if (Date.now() - GamingRoom["끝말잇기"][room][1] >= TIMELIMIT) return false;
              if (APICount >= 50000) return false;

              APICount++;

              let DictDocument = org.jsoup.Jsoup
              .connect(APIURL)
              .data("key", KEY)
              .data("q", query)
              .data("sort", sortMethod[index])
              .data("start", i)
              .data("method", "start")
              .data("advanced", "y")
              .data("type1", "word")
              .data("type3", "general,dialect,nkorean")
              .data("type4", type4[type4_index])
              .data("pos", "1,2,11,18")
              .data("cat", cat)
              .data("letter_s", "2")
              .data("letter_e", "80")
              .parser(org.jsoup.parser.Parser.xmlParser())
              .get();

              TotalCount = parseInt(DictDocument.getElementsByTag("total").eachText().get(0));
        
              if (TotalCount > 0)
              {
                StringWordArray = DictDocument.getElementsByTag("word").eachText();
        
                while (StringWordArray.size() > 0)
                {
                  if (Date.now() - GamingRoom["끝말잇기"][room][1] >= TIMELIMIT) return false;

                  Word_Index = Math.floor(Math.random() * StringWordArray.size());
                  Check = StringWordArray.get(Word_Index).replace(REG, '').replace(/ /g, '');
        
                  if (GamingRoom["끝말잇기"][room][5].indexOf(Check) < 0)
                  {
                    let isExist = true;

                    if (GamingRoom["끝말잇기"][room][9] === 2)
                    {
                      let initialLaw = KorDivision(Check[Check.length-1], '', 1);
                      for (let k = 0; k < initialLaw.length; k++)
                      {
                        if (FindOneStrikeWord(initialLaw[k]))
                        {
                          isExist = false;
                          tempDef[tempDef.length] = DictDocument.getElementsByTag("definition").eachText().get(Word_Index);
                          tempLink[tempLink.length] = DictDocument.getElementsByTag("link").eachText().get(Word_Index+1);
                          temporary[temporary.length] = Check;
                          break;
                        }
                      }
                    }
                    if (isExist)
                    {
                      i = 1001;
                      type4 = [];
                      sortMethod = [];
                      Result = Check;
                      StringLink = DictDocument.getElementsByTag("link").eachText().get(Word_Index+1);
                      StringDefinition = DictDocument.getElementsByTag("definition").eachText().get(Word_Index);
                      break; // ALL break;
                    }
                  }
                  StringWordArray.remove(Word_Index);
                }
              }
              else if (i <= 1 && type4.length <= 1) {i = 1001; type4 = []; sortMethod = []; AddOneStrikeWord(GamingRoom["끝말잇기"][room][10])} // -> 한방단어 msg = addonestrike
              else break; // for break;
            }
            break; // switch break
          }
        }
        if (type4.length > 0) {type4.splice(type4_index, 1); type4_index = 0;}
      }
      if (sortMethod.length > 0) {sortMethod.splice(index, 1); index = Math.floor(Math.random() * sortMethod.length);}
    }

    if (Result === '' && state === 1 && temporary.length > 0)
    {
      let result_index = Math.floor(Math.random() * temporary.length);
      if (save) GamingRoom["끝말잇기"][room][6][GamingRoom["끝말잇기"][room][6].length] = [tempDef[result_index], tempLink[result_index]];
      return temporary[result_index];
    }
    else
    {
      if (Result !== '' && save) GamingRoom["끝말잇기"][room][6][GamingRoom["끝말잇기"][room][6].length] = [StringDefinition, StringLink];
      return Result;
    }
  }
  catch(e)
  {
    Api.replyRoom("ㅈㅇㅎ", "[" + e.lineNumber + "]\n" + e);
    return false;
  }
}

function KorDivision(A, B, state)
{
  const VOWEL_TRANS = ['ㅣ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅖ'];
  let Block_A = Hangul.disassemble(A);

  if (state === 0)
  {
    if (!Hangul.isHangul(B)) return false;
    if (A === B) return true;
    if (Block_A[0] === 'ㄹ') Block_A[0] = 'ㄴ';
    if (Hangul.assemble(Block_A) === B) return true;
    if (Block_A[0] === 'ㄴ' && VOWEL_TRANS.indexOf(Block_A[1]) >= 0) Block_A[0] = 'ㅇ';
    if (Hangul.assemble(Block_A) === B) return true;
    return false;
  }
  else if (state === 1)
  {
    let result = [A];

    if (Block_A[0] === 'ㄹ')
    {
      Block_A[0] = 'ㄴ';
      result[result.length] = Hangul.assemble(Block_A);
    }

    if (Block_A[0] === 'ㄴ' && VOWEL_TRANS.indexOf(Block_A[1]) >= 0)
    {
      Block_A[0] = 'ㅇ';
      result[result.length] = Hangul.assemble(Block_A);
    }

    return result.reverse();
  }
}

function RemainApiCountFormatting()
{
  let remain = (50000 - APICount) + '';
  let formatting = '';
  for (let i = 0; i < 5 - remain.length; i++)
  {
    formatting += '0';
  }

  return formatting + remain;
}

function FindOneStrikeWord(str)
{
  let OneSTRIKE = FileStream.read(PATH + "WordChainGame/OneSTRIKE.txt") + '';
  let OneSTRIKE_index = FileStream.read(PATH + "WordChainGame/OneSTRIKE_Index.txt") + '';

  if (OneSTRIKE_index !== "null")
  {
    OneSTRIKE_index = OneSTRIKE_index.trim().split(' ');
    let i = OneSTRIKE_index.indexOf(str[0]);
    if (i >= 0)
    {
      return OneSTRIKE.trim().split(' ')[i];
    }
  }

  return '';
}

function AddOneStrikeWord(str)
{
  let OneSTRIKE_index = FileStream.read(PATH + "WordChainGame/OneSTRIKE_Index.txt") + '';
  if (OneSTRIKE_index === "null")
  {
    FileStream.append(PATH + "WordChainGame/OneSTRIKE.txt", str + ' ');
    FileStream.append(PATH + "WordChainGame/OneSTRIKE_Index.txt", str[0] + ' ');
  }
  else
  {
    OneSTRIKE_index = OneSTRIKE_index.trim().split(' ');
    if (OneSTRIKE_index.indexOf(str[0]) < 0)
    {
      FileStream.append(PATH + "WordChainGame/OneSTRIKE.txt", str + ' ');
      FileStream.append(PATH + "WordChainGame/OneSTRIKE_Index.txt", str[0] + ' ');
    }
  }
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}