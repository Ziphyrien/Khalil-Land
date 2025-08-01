---
title: 服务器玩家档案
tag:
  - wiki
  - 玩家档案
createTime: 2025/07/06 15:39:21
permalink: /guide/h0bcmpxl/
---

## **服务器内玩家档案明细**

<font color= red>请认真阅读该文档，如果你要建立档案的话</font> <br/>
在大部分档案中，性格这一栏需要自填    
该文档旨在提供本服务器中早起玩家或有重要事件包括贡献的人  
以及三周目前加入服务器的活跃人  

玩家文档制定格式如下
```md
---
title: 玩家档案"<游戏内昵称>"
tag: wiki
createTime: <时间>
permalink: /PlayerDocs/<游戏内昵称>/
---
**玩家档案**  
### 玩家昵称 : <游戏内昵称>  
#### 群内昵称 : <QQ群昵称>  
入服时间 : <年/月/日>  
贡献 : (<时间><地点><人物>)(非必要<所做><影响>)  
性格 : <性格>  
身份 : 如<组织><组织内身份><群内身份>等  
资产 : <数字> <不动产(如田地、建筑等)>  
_群等级 : LV<数字>_  
~~UID : yyyy-mm-dd-xxxxxxxx~~
```
**请注意**UID中"yyyy"指年份，"mm"指月份，"dd"指日，最后的八位"xxxxxxxx"由以下CSharp代码生成
```cs
using System.Text;
using System.Security.Cryptography;
class Program
{
    static readonly string _oldName = "<游戏内昵称>";
    static readonly char[] Characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".ToCharArray();
    static void Main()
    {
        Console.WriteLine(GenerateId(_oldName));
    }
    static string GenerateId(string name)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("Name is Null", nameof(name));
        }

        // 把名字转换为字节数组
        byte[] nameBytes = Encoding.UTF8.GetBytes(name);

        // 计算名字的SHA256哈希值
        byte[] hashBytes;
        using (SHA256 sha256 = SHA256.Create())
        {
            hashBytes = sha256.ComputeHash(nameBytes);
        }

        // 将哈希字节数组转换为8位长的ID
        char[] idChars = new char[8];
        for (int i = 0; i < 8; i++)
        {
            // 确保索引在字符集范围内
            int index = Math.Abs(hashBytes[i]) % Characters.Length;
            idChars[i] = Characters[index];
        }

        return new string(idChars);
    }
}
```
示例（使用数据源于上周目）:
```md
---
title: 玩家档案"JA13"
tag: wiki
createTime: 2025/07/07 15:02:22
permalink: /PlayerDocs/JA13/
---
**玩家档案**  
### 玩家昵称 : JA13  
#### 群内昵称 : jljjz  
入服时间 : 2023/08/08  
贡献 : 2023/08/08 服务器最早一批玩家   2025/07/06 服务器Wiki构建者  
性格 : 闲的没事就会找乐子，喜欢做休闲的事纯养老。喜欢大块平原，可以告知给其，住所常位于山中、地下  
身份 : 小麦谷 创建人 管理员  
资产 : 500M 田地75亩，70m²樱花材质房、100m²樱花材质房、100m²地下基地、1000m²地下联通隧道及图书馆和电梯  
_群等级 : LV100_  
~~UID : 2023-08-08-12nM7gfi~~
```