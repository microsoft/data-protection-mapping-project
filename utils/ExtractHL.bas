Attribute VB_Name = "Module1"
Sub ExtractHL()
    Dim HL As Hyperlink
    For Each HL In ActiveSheet.Hyperlinks
        Set c = HL.Parent.TopLeftCell
        If Not IsNull(c) Then
            Set c = ActiveSheet.Cells(c.Row, c.Column)
            Debug.Print (c)
            c.Value = c.Text + "[" + HL.Address + "#" + HL.SubAddress + "]"
            Debug.Print (c.Text + HL.Address)
        End If
    Next
End Sub

