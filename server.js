const express = require('express');
const cors = require('cors');

const app = express();
const port = 8080;

const trRegEx = new RegExp(/[^a-zA-ZıİğĞüÜşŞöÖçÇ’/\\n]/g);
const trLetters = {"İ": "i", "I": "ı", "Ş": "ş", "Ğ": "ğ", "Ü": "ü", "Ö": "ö", "Ç": "ç" };

const MOST_COMMON = 5;

const stopWordEn = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", 
                    "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", 
                    "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", 
                    "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", 
                    "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", 
                    "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", 
                    "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", 
                    "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", 
                    "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", 
                    "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
                    "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];

const stopWordTr = ["acaba", "altı", "altmış", "ama", "ancak", "arada", "artık", "asla", "aslında", "aslında", "ayrıca", 
                    "az", "bana", "bazen", "bazı", "bazıları", "belki", "ben", "benden", "beni", "benim", "beri", "beş", "bile", 
                    "bilhassa", "bin", "bir", "biraz", "birçoğu", "birçok", "biri", "birisi", "birkaç", "birşey", "biz", "bizden", 
                    "bize", "bizi", "bizim", "böyle", "böylece", "bu", "buna", "bunda", "bundan", "bunlar", "bunları", "bunların", 
                    "bunu", "bunun", "burada", "bütün", "çoğu", "çoğunu", "çok", "çünkü", "da", "daha", "dahi", "dan", "de", "defa", 
                    "değil", "diğer", "diğeri", "diğerleri", "diye", "doksan", "dokuz", "dolayı", "dolayısıyla", "dört", "edecek", 
                    "eden", "ederek", "edilecek", "ediliyor", "edilmesi", "ediyor", "eğer", "elbette", "elli", "en", "etmesi", "etti", 
                    "ettiği", "ettiğini", "fakat", "falan", "filan", "gene", "gereği", "gerek", "gibi", "göre", "hala", "halde", "halen", 
                    "hangi", "hangisi", "hani", "hatta", "hem", "henüz", "hep", "hepsi", "her", "herhangi", "herkes", "herkese", "herkesi", 
                    "herkesin", "hiç", "hiçbir", "hiçbiri", "için", "içinde", "iki", "ile", "ilgili", "ise", "işte", "itibaren", "itibariyle", 
                    "kaç", "kadar", "karşın", "kendi", "kendilerine", "kendine", "kendini", "kendisi", "kendisine", "kendisini", "kez", "ki", "kim", 
                    "kime", "kimi", "kimin", "kimisi", "kimse", "kırk", "madem", "mi", "mı", "milyar", "milyon", "mu", "mü", "nasıl", "ne", "neden", 
                    "nedenle", "nerde", "nerede", "nereye", "neyse", "niçin", "nin", "nın", "niye", "nun", "nün", "o", "öbür", "olan", "olarak", "oldu", 
                    "olduğu", "olduğunu", "olduklarını", "olmadı", "olmadığı", "olmak", "olması", "olmayan", "olmaz", "olsa", "olsun", "olup", "olur", "olur", 
                    "olursa", "oluyor", "on", "ön", "ona", "önce", "ondan", "onlar", "onlara", "onlardan", "onları", "onların", "onu", "onun", "orada", "öte", 
                    "ötürü", "otuz", "öyle", "oysa", "pek", "rağmen", "sana", "sanki", "sanki", "şayet", "şekilde", "sekiz", "seksen", "sen", "senden", "seni", 
                    "senin", "şey", "şeyden", "şeye", "şeyi", "şeyler", "şimdi", "siz", "siz", "sizden", "sizden", "size", "sizi", "sizi", "sizin", "sizin", 
                    "sonra", "şöyle", "şu", "şuna", "şunları", "şunu", "ta", "tabii", "tam", "tamam", "tamamen", "tarafından", "trilyon", "tüm", "tümü", 
                    "üç", "üzere", "var", "vardı", "ve", "veya", "ya", "yani", "yapacak", "yapılan", "yapılması", "yapıyor", "yapmak", "yaptı", "yaptığı", 
                    "yaptığını", "yaptıkları", "ye", "yedi", "yerine", "yetmiş", "yi", "yı", "yine", "yirmi", "yoksa", "yu", "yüz", "zaten", "zira"];

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
    var info_package = await analyze_text(req.body.text);
    var deployment = {};
    if(req.query.analysis){
        for(let elements of (req.query.analysis).split(',')){
            deployment[elements] = info_package[elements];
        }
    }
    else{
        deployment = info_package;
    }
    res.send(deployment);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

async function analyze_text(plainText){
    plainText = plainText.replace(/\\n/g,"");

    var result = {}

    var word_count = -1;
    var number_of_letters = -1;
    var longest_word = "";
    var average_word_length = 0;
    var median_word_long = 1;
    var median_word = 1;
    var common_words = [];
    var guessed_language = "";

    var start_time = Date.now();
    var commons = {};
    var common_sorted = {};
    var words = plainText.split(trRegEx).filter(el=>el!=="");
    var sorted_words = words.sort((a,b)=>b.length-a.length);
    var enRank = 0;
    var trRank = 0;

    word_count = words.length;
    number_of_letters = plainText.length;
    longest_word = sorted_words[0];
    median_word = sorted_words[parseInt(word_count/2)];
    median_word_long = median_word.length;
    for(let word of sorted_words){
        word = word.toLowerCase();
        word = word.replace(/[İIĞÜŞÖÇ]/g, el=>trLetters[el]);
        if(commons[word]){
            commons[word] += 1;
        }
        else{
            commons[word] = 1;
        }
        average_word_length+=word.length;
    }
    common_sorted = (JSON.stringify(commons).replace(/[{|}]/g,'').split(',')).sort((b,a)=>{return a[a.length-1]-b[b.length-1]});
    for(let word of common_sorted){
        if(common_words.length < MOST_COMMON){
            word = (word.split(':')[0]).replace(/\"/g,'');
            common_words.push(word);
        }
        else{
            break;
        }
    }

    for(let word of words){
        if(stopWordTr.includes(word)) trRank++;
        if(stopWordEn.includes(word)) enRank++;
    }

    if(enRank > trRank) guessed_language = "English";
    else if(enRank < trRank) guessed_language = "Turkish";
    else guessed_language = "Prediction failed."



    var end_time = Date.now();

    result["duration"] = end_time-start_time;
    result["wordCount"] = word_count;
    result["letters"] = number_of_letters;
    result["longest"] = longest_word;
    result["avgLength"] = (average_word_length/word_count).toPrecision(3);
    result["medianWordLength"] = median_word_long;
    result["medianWord"] = median_word;
    result["language"] = guessed_language;
    result["commonWords"] = common_words;

    return result;
}